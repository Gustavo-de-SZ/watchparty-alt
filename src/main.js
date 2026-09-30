import {
  initRoom,
  sendChatMessage,
  updateProfile,
  leaveRoom,
  getSelfId,
  getPeers,
  getLocalProfile,
  requestHistoryFromPeers,
  sendHistoryDelta
} from './webrtc.js';
import {
  startScreenShare,
  stopScreenShare,
  attachStreamToVideo,
  detachStreamFromVideo,
  canShareScreen,
  isMobileDevice,
  isCurrentlySharing
} from './screenshare.js';
import {
  getStoredUsername,
  saveUsername,
  getAvatarColor,
  ChatManager
} from './chat.js';
import {
  getRoomMessages,
  getLatestMessageTimestamp
} from './db.js';
import {
  PRESET_AVATARS,
  getStoredAvatar,
  saveStoredAvatar,
  compressImageToDataURL,
  renderAvatarInto
} from './avatars.js';
import {
  initTheme,
  applyPalette,
  DARK_PALETTES,
  LIGHT_PALETTES,
  getCurrentThemeState
} from './theme.js';

// Initialize Theme immediately on script evaluation
let themeState = initTheme();

// DOM Elements
const modalLobby = document.getElementById('modal-lobby');
const modalEditName = document.getElementById('modal-edit-name');
const inputUsername = document.getElementById('input-username');
const inputEditUsername = document.getElementById('input-edit-username');
const inputRoomCode = document.getElementById('input-room-code');
const btnCreateRoom = document.getElementById('btn-create-room');
const btnJoinRoom = document.getElementById('btn-join-room');

// Avatar DOM elements
const lobbyAvatarGrid = document.getElementById('lobby-avatar-grid');
const editAvatarGrid = document.getElementById('edit-avatar-grid');
const btnUploadAvatarLobby = document.getElementById('btn-upload-avatar-lobby');
const btnUploadAvatarEdit = document.getElementById('btn-upload-avatar-edit');
const inputAvatarFile = document.getElementById('input-avatar-file');

// Theme DOM elements
const btnToggleTheme = document.getElementById('btn-toggle-theme');
const btnModeDark = document.getElementById('btn-mode-dark');
const btnModeLight = document.getElementById('btn-mode-light');
const palettePickerGrid = document.getElementById('palette-picker-grid');
const inputCustomAccent = document.getElementById('input-custom-accent');

// Header elements
const roomInfoBadge = document.getElementById('room-info-badge');
const roomCodeDisplay = document.getElementById('room-code-display');
const btnCopyLink = document.getElementById('btn-copy-link');
const copyToast = document.getElementById('copy-toast');
const latencyIndicator = document.getElementById('latency-indicator');
const latencyText = document.getElementById('latency-text');
const btnTogglePeers = document.getElementById('btn-toggle-peers');
const peersCount = document.getElementById('peers-count');
const tabPeersCount = document.getElementById('tab-peers-count');
const userChip = document.getElementById('user-chip');
const userAvatar = document.getElementById('user-avatar');
const userNameDisplay = document.getElementById('user-name-display');
const btnLeaveRoom = document.getElementById('btn-leave-room');

// Video Stage elements
const videoWrapper = document.getElementById('video-wrapper');
const remoteVideo = document.getElementById('remote-video');
const videoPlaceholder = document.getElementById('video-placeholder');
const placeholderTitle = document.getElementById('placeholder-title');
const placeholderSubtitle = document.getElementById('placeholder-subtitle');
const btnPlaceholderShare = document.getElementById('btn-placeholder-share');
const mobileViewerNote = document.getElementById('mobile-viewer-note');
const presenterTag = document.getElementById('presenter-tag');
const presenterName = document.getElementById('presenter-name');
const audioUnlockOverlay = document.getElementById('audio-unlock-overlay');
const btnUnlockAudio = document.getElementById('btn-unlock-audio');
const videoControlsBar = document.getElementById('video-controls-bar');

// Video Controls
const btnToggleMute = document.getElementById('btn-toggle-mute');
const iconVolumeHigh = document.getElementById('icon-volume-high');
const iconVolumeMuted = document.getElementById('icon-volume-muted');
const volumeSlider = document.getElementById('volume-slider');
const btnPip = document.getElementById('btn-pip');
const btnFitMode = document.getElementById('btn-fit-mode');
const btnFullscreen = document.getElementById('btn-fullscreen');
const iconFsEnter = document.getElementById('icon-fs-enter');
const iconFsExit = document.getElementById('icon-fs-exit');

// Bottom Action Bar
const btnShareScreen = document.getElementById('btn-share-screen');
const btnShareText = document.getElementById('btn-share-text');
const btnToggleChat = document.getElementById('btn-toggle-chat');
const chatUnreadBadge = document.getElementById('chat-unread-badge');
const btnInvite = document.getElementById('btn-invite');

// Sidebar & Chat elements
const chatSidebar = document.getElementById('chat-sidebar');
const btnCloseSidebar = document.getElementById('btn-close-sidebar');
const tabChat = document.getElementById('tab-chat');
const tabParticipants = document.getElementById('tab-participants');
const panelChat = document.getElementById('panel-chat');
const panelParticipants = document.getElementById('panel-participants');
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const participantsList = document.getElementById('participants-list');

// Application State
let currentRoomId = null;
let currentUsername = getStoredUsername();
let currentAvatar = getStoredAvatar();
let activePresenterId = null;
let chatManager = null;
const isMobile = isMobileDevice();

// Track which avatar target triggered file upload
let avatarUploadTarget = 'lobby'; // 'lobby' or 'edit'

// Initialize App
function initApp() {
  updateUserUI();
  populateAvatarGrids();

  // Initialize Chat Manager with selfId tracking
  chatManager = new ChatManager({
    messagesContainer: chatMessages,
    unreadBadgeElement: chatUnreadBadge,
    currentSelfId: getSelfId(),
    onNewMessage: () => {
      // New message added
    }
  });

  // Mobile specific setup
  if (isMobile) {
    mobileViewerNote.classList.remove('hidden');
    // Mobile users will strictly watch and chat, never host
    btnPlaceholderShare.classList.add('hidden');
    btnShareScreen.classList.add('hidden');
  }

  // Pre-fill username
  inputUsername.value = currentUsername;

  // Check URL hash for direct room link (e.g. #room=room123)
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const urlRoom = hashParams.get('room');
  if (urlRoom) {
    inputRoomCode.value = urlRoom;
  }

  setupEventListeners();
}

function updateUserUI() {
  userNameDisplay.textContent = currentUsername;
  const color = getAvatarColor(currentUsername);
  renderAvatarInto(userAvatar, currentAvatar, currentUsername, color);
}

function populateAvatarGrids() {
  renderAvatarGrid(lobbyAvatarGrid);
  renderAvatarGrid(editAvatarGrid);
}

function renderAvatarGrid(container) {
  if (!container) return;
  container.innerHTML = '';

  // Render presets
  PRESET_AVATARS.forEach((preset) => {
    const el = document.createElement('div');
    el.className = `avatar-option ${currentAvatar === preset.id ? 'selected' : ''}`;
    el.dataset.id = preset.id;
    el.title = preset.name;
    el.innerHTML = preset.svg;

    el.addEventListener('click', () => {
      selectAvatar(preset.id);
    });

    container.appendChild(el);
  });

  // If current avatar is a custom data URL, render a custom thumbnail slot
  if (currentAvatar && currentAvatar.startsWith('data:image/')) {
    const customOption = document.createElement('div');
    customOption.className = 'avatar-option selected';
    customOption.dataset.id = 'custom';
    customOption.title = 'Custom Photo';

    const img = document.createElement('img');
    img.src = currentAvatar;
    img.className = 'avatar-custom-img';
    customOption.appendChild(img);

    container.insertBefore(customOption, container.firstChild);
  }
}

function selectAvatar(avatarIdOrDataUrl) {
  currentAvatar = avatarIdOrDataUrl;
  saveStoredAvatar(currentAvatar);
  updateUserUI();
  populateAvatarGrids();

  // If already in a room, broadcast update to peers
  if (currentRoomId) {
    updateProfile({
      avatar: currentAvatar
    });
    updatePeersList();
  }
}

function setupEventListeners() {
  // Avatar Upload Buttons
  btnUploadAvatarLobby.addEventListener('click', () => {
    avatarUploadTarget = 'lobby';
    inputAvatarFile.click();
  });

  btnUploadAvatarEdit.addEventListener('click', () => {
    avatarUploadTarget = 'edit';
    inputAvatarFile.click();
  });

  inputAvatarFile.addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      const dataUrl = await compressImageToDataURL(file, 80, 0.8);
      selectAvatar(dataUrl);
    } catch (err) {
      alert(`Could not process avatar photo: ${err.message}`);
    } finally {
      inputAvatarFile.value = '';
    }
  });

  // Lobby Actions
  btnCreateRoom.addEventListener('click', handleCreateRoom);
  btnJoinRoom.addEventListener('click', handleJoinRoom);
  inputRoomCode.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleJoinRoom();
  });

  // Header Actions
  btnCopyLink.addEventListener('click', copyInviteLink);
  btnInvite.addEventListener('click', copyInviteLink);
  btnLeaveRoom.addEventListener('click', handleLeaveRoom);

  // Profile Edit
  userChip.addEventListener('click', openEditNameModal);
  btnToggleTheme.addEventListener('click', openEditNameModal);
  document.getElementById('btn-cancel-edit-name').addEventListener('click', closeEditNameModal);
  document.getElementById('form-edit-name').addEventListener('submit', handleSaveName);

  // Theme & Mood Palettes
  btnModeDark.addEventListener('click', () => switchThemeMode('dark'));
  btnModeLight.addEventListener('click', () => switchThemeMode('light'));
  inputCustomAccent.addEventListener('input', handleCustomAccentChange);

  // Screensharing Actions (Desktop Only)
  if (!isMobile) {
    btnShareScreen.addEventListener('click', toggleScreenSharing);
    btnPlaceholderShare.addEventListener('click', toggleScreenSharing);
  }

  // Audio Unlock Button (For Android autoplay policy)
  btnUnlockAudio.addEventListener('click', () => {
    remoteVideo.muted = false;
    remoteVideo.play()
      .then(() => {
        audioUnlockOverlay.classList.add('hidden');
        updateVolumeUI();
      })
      .catch((err) => console.warn('Could not unmute:', err));
  });

  // Video Controls
  btnToggleMute.addEventListener('click', toggleMute);
  volumeSlider.addEventListener('input', handleVolumeChange);
  btnFullscreen.addEventListener('click', toggleFullscreen);
  btnFitMode.addEventListener('click', toggleFitMode);

  if (document.pictureInPictureEnabled) {
    btnPip.addEventListener('click', togglePip);
  } else {
    btnPip.classList.add('hidden');
  }

  document.addEventListener('fullscreenchange', updateFullscreenIcons);

  // Sidebar Tabs
  tabChat.addEventListener('click', () => switchTab('chat'));
  tabParticipants.addEventListener('click', () => switchTab('participants'));
  btnToggleChat.addEventListener('click', toggleChatSidebar);
  btnCloseSidebar.addEventListener('click', () => setSidebarOpen(false));

  // Chat Form Submission
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value;
    if (!text.trim()) return;

    const msg = sendChatMessage(text);
    if (msg) {
      chatManager.addMessage(msg, true, true);
    }
    chatInput.value = '';
    chatInput.focus();
  });
}

/**
 * Create a new random room code and join
 */
function handleCreateRoom() {
  const name = inputUsername.value.trim() || currentUsername;
  saveUsername(name);
  currentUsername = name;
  updateUserUI();

  const generatedCode = `party-${Math.random().toString(36).slice(2, 8)}`;
  joinPartyRoom(generatedCode);
}

/**
 * Join an existing room code
 */
function handleJoinRoom() {
  const name = inputUsername.value.trim() || currentUsername;
  saveUsername(name);
  currentUsername = name;
  updateUserUI();

  const code = (inputRoomCode.value.trim() || '').toLowerCase();
  if (!code) {
    inputRoomCode.focus();
    return;
  }
  joinPartyRoom(code);
}

/**
 * Connect to room via WebRTC with IndexedDB hydration and P2P Catch-Up
 */
async function joinPartyRoom(roomId) {
  currentRoomId = roomId;
  window.location.hash = `room=${roomId}`;

  // Update Header UI
  roomCodeDisplay.textContent = roomId;
  roomInfoBadge.classList.remove('hidden');
  latencyIndicator.classList.remove('hidden');
  btnTogglePeers.classList.remove('hidden');
  btnLeaveRoom.classList.remove('hidden');
  modalLobby.classList.add('hidden');

  // Step 1: Hydrate Chat from local browser IndexedDB
  try {
    const cachedMessages = await getRoomMessages(roomId, 0);
    if (cachedMessages && cachedMessages.length > 0) {
      chatManager.loadHistory(cachedMessages, false);
      chatManager.addSystemMessage(`Restored ${cachedMessages.length} message(s) from local storage`);
    }
  } catch (err) {
    console.warn('Could not load cached messages:', err);
  }

  // Step 2: Initialize Room
  initRoom({
    roomId,
    profile: {
      name: currentUsername,
      role: 'viewer',
      color: getAvatarColor(currentUsername),
      avatar: currentAvatar
    },
    onPeerJoin: async (peerId, peer) => {
      chatManager.addSystemMessage(`${peer.name || 'A user'} joined the party`);
      updatePeersList();

      // Ask connected peers for any messages we missed
      try {
        const latestTime = await getLatestMessageTimestamp(roomId);
        requestHistoryFromPeers(latestTime);
      } catch (e) {
        console.warn('History catch-up request error:', e);
      }
    },
    onPeerLeave: (peerId, peer) => {
      const name = peer ? peer.name : 'A user';
      chatManager.addSystemMessage(`${name} left the party`);
      if (activePresenterId === peerId) {
        handlePresenterStopped();
      }
      updatePeersList();
    },
    onStream: (stream, peerId) => {
      activePresenterId = peerId;
      const peers = getPeers();
      const hostPeer = peers.find(p => p.peerId === peerId);
      const hostName = hostPeer ? hostPeer.name : 'Host';

      showRemoteStream(stream, hostName);
      chatManager.addSystemMessage(`${hostName} started screen sharing`);
      updatePeersList();
    },
    onStreamState: (state, peerId) => {
      if (state.isSharing) {
        activePresenterId = peerId;
      } else {
        if (activePresenterId === peerId) {
          handlePresenterStopped();
        }
      }
      updatePeersList();
    },
    onChatMessage: (message) => {
      chatManager.addMessage(message, false, true);
    },
    onProfileUpdate: () => {
      updatePeersList();
    },
    onPingUpdate: (peerId, latency) => {
      latencyText.textContent = `${latency} ms`;
    },
    // Anti-Entropy History Catch-up Handlers
    onHistoryRequest: async ({ since, roomId: reqRoomId }, peerId) => {
      if (reqRoomId === currentRoomId) {
        try {
          const delta = await getRoomMessages(reqRoomId, since);
          if (delta && delta.length > 0) {
            sendHistoryDelta(peerId, delta);
          }
        } catch (e) {
          console.warn('Error serving history delta:', e);
        }
      }
    },
    onHistoryResponse: (messages) => {
      if (messages && messages.length > 0) {
        chatManager.loadHistory(messages, true);
        chatManager.addSystemMessage(`Synced ${messages.length} message(s) from peers`);
      }
    },
    onError: (err) => {
      console.error('Room connection error:', err);
      chatManager.addSystemMessage(`Connection error: ${err.message || 'Relay issue'}`);
    }
  });

  chatManager.setSelfId(getSelfId());
  updatePeersList();
}

/**
 * Display remote video stream
 */
function showRemoteStream(stream, presenterTitle) {
  videoPlaceholder.classList.add('hidden');
  videoControlsBar.classList.remove('hidden');
  presenterTag.classList.remove('hidden');
  presenterName.textContent = `${presenterTitle} is sharing`;

  attachStreamToVideo(remoteVideo, stream, () => {
    // Autoplay audio was blocked by browser policy (common on mobile Android)
    audioUnlockOverlay.classList.remove('hidden');
  });

  updateVolumeUI();
}

/**
 * Handle presenter stopping the screen share
 */
function handlePresenterStopped() {
  activePresenterId = null;
  detachStreamFromVideo(remoteVideo);
  videoPlaceholder.classList.remove('hidden');
  videoControlsBar.classList.add('hidden');
  presenterTag.classList.add('hidden');
  audioUnlockOverlay.classList.add('hidden');

  placeholderTitle.textContent = 'Screen Share Ended';
  placeholderSubtitle.textContent = 'Waiting for host to share a window, tab, or screen.';
  chatManager.addSystemMessage('Screen sharing has stopped');
}

/**
 * Toggle screen sharing for host (Desktop Only)
 */
async function toggleScreenSharing() {
  if (isMobile) return;

  if (isCurrentlySharing()) {
    stopScreenShare();
    handleLocalShareStopped();
  } else {
    try {
      const stream = await startScreenShare({
        onEnded: () => {
          handleLocalShareStopped();
        },
        onError: (err) => {
          chatManager.addSystemMessage(`Could not start screenshare: ${err.message}`);
        }
      });

      if (stream) {
        // Show local preview in stage (muted to avoid audio loop)
        videoPlaceholder.classList.add('hidden');
        videoControlsBar.classList.remove('hidden');
        presenterTag.classList.remove('hidden');
        presenterName.textContent = 'You are sharing';
        remoteVideo.srcObject = stream;
        remoteVideo.muted = true;
        remoteVideo.play().catch(e => console.warn(e));

        btnShareScreen.classList.add('is-sharing');
        btnShareText.textContent = 'Stop Sharing';
        chatManager.addSystemMessage('You started screen sharing');
        updatePeersList();
      }
    } catch (err) {
      console.error('Failed to start screenshare:', err);
    }
  }
}

function handleLocalShareStopped() {
  btnShareScreen.classList.remove('is-sharing');
  btnShareText.textContent = 'Share Screen';
  detachStreamFromVideo(remoteVideo);
  videoPlaceholder.classList.remove('hidden');
  videoControlsBar.classList.add('hidden');
  presenterTag.classList.add('hidden');

  placeholderTitle.textContent = 'No Screen is Being Shared';
  placeholderSubtitle.textContent = 'Waiting for host to share a window, tab, or screen.';
  chatManager.addSystemMessage('You stopped screen sharing');
  updatePeersList();
}

/**
 * Update participants list and badges with custom avatars
 */
function updatePeersList() {
  const peers = getPeers();
  const totalCount = peers.length + 1; // peers + self
  peersCount.textContent = totalCount;
  tabPeersCount.textContent = totalCount;

  participantsList.innerHTML = '';

  // Add self
  const selfItem = createParticipantItem({
    name: currentUsername,
    color: getAvatarColor(currentUsername),
    avatar: currentAvatar,
    isSelf: true,
    isHost: isCurrentlySharing()
  });
  participantsList.appendChild(selfItem);

  // Add peers
  peers.forEach((peer) => {
    const isPeerHost = (activePresenterId === peer.peerId) || (peer.role === 'host');
    const item = createParticipantItem({
      name: peer.name || 'User',
      color: peer.color || getAvatarColor(peer.name || 'User'),
      avatar: peer.avatar,
      isSelf: false,
      isHost: isPeerHost,
      latency: peer.latency
    });
    participantsList.appendChild(item);
  });
}

function createParticipantItem({ name, color, avatar, isSelf, isHost, latency }) {
  const el = document.createElement('div');
  el.className = 'participant-item';

  const info = document.createElement('div');
  info.className = 'participant-info';

  const avatarEl = document.createElement('span');
  avatarEl.className = 'chat-avatar';
  renderAvatarInto(avatarEl, avatar, name, color);

  const nameSpan = document.createElement('span');
  nameSpan.className = 'participant-name';
  nameSpan.textContent = isSelf ? `${name} (You)` : name;

  info.appendChild(avatarEl);
  info.appendChild(nameSpan);

  const badges = document.createElement('div');
  badges.className = 'participant-badges';

  if (isHost) {
    const hostBadge = document.createElement('span');
    hostBadge.className = 'badge-host';
    hostBadge.textContent = 'HOST';
    badges.appendChild(hostBadge);
  }

  if (latency) {
    const latSpan = document.createElement('span');
    latSpan.className = 'chat-time';
    latSpan.textContent = `${latency}ms`;
    badges.appendChild(latSpan);
  }

  el.appendChild(info);
  el.appendChild(badges);
  return el;
}

/**
 * Copy Invite Link to Clipboard
 */
function copyInviteLink() {
  const url = `${window.location.origin}${window.location.pathname}#room=${currentRoomId}`;
  navigator.clipboard.writeText(url).then(() => {
    copyToast.classList.remove('hidden');
    setTimeout(() => {
      copyToast.classList.add('hidden');
    }, 2000);
  }).catch(() => {
    prompt('Copy this party link:', url);
  });
}

/**
 * Leave Room
 */
function handleLeaveRoom() {
  if (isCurrentlySharing()) {
    stopScreenShare();
  }
  leaveRoom();
  detachStreamFromVideo(remoteVideo);

  currentRoomId = null;
  activePresenterId = null;
  window.location.hash = '';

  // Reset UI
  roomInfoBadge.classList.add('hidden');
  latencyIndicator.classList.add('hidden');
  btnTogglePeers.classList.add('hidden');
  btnLeaveRoom.classList.add('hidden');
  videoControlsBar.classList.add('hidden');
  presenterTag.classList.add('hidden');
  audioUnlockOverlay.classList.add('hidden');
  videoPlaceholder.classList.remove('hidden');
  chatManager.clear();
  modalLobby.classList.remove('hidden');
}

/**
 * Edit Name & Profile Modal
 */
function openEditNameModal() {
  inputEditUsername.value = currentUsername;
  modalEditName.classList.remove('hidden');
  populateAvatarGrids();
  renderPalettePickerGrid();
  inputEditUsername.focus();
}

function closeEditNameModal() {
  modalEditName.classList.add('hidden');
}

function renderPalettePickerGrid() {
  if (!palettePickerGrid) return;
  palettePickerGrid.innerHTML = '';

  const palettes = themeState.mode === 'dark' ? DARK_PALETTES : LIGHT_PALETTES;

  palettes.forEach((palette) => {
    const isSelected = palette.id === themeState.paletteId;
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `palette-card ${isSelected ? 'selected' : ''}`;
    card.style.backgroundColor = palette.colors.bgApp;
    card.style.borderColor = isSelected ? 'var(--border-selected)' : palette.colors.borderCard;

    const info = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'palette-title';
    title.style.color = palette.colors.textMain;
    title.textContent = palette.name;

    const desc = document.createElement('div');
    desc.className = 'palette-desc';
    desc.style.color = palette.colors.textMuted;
    desc.textContent = palette.description;

    info.appendChild(title);
    info.appendChild(desc);

    const swatches = document.createElement('div');
    swatches.className = 'palette-swatches';

    const dot1 = document.createElement('span');
    dot1.className = 'swatch-dot';
    dot1.style.backgroundColor = palette.colors.bgTopbar;
    dot1.style.borderColor = palette.colors.borderSubtle;

    const dot2 = document.createElement('span');
    dot2.className = 'swatch-dot';
    dot2.style.backgroundColor = palette.colors.bgCard;
    dot2.style.borderColor = palette.colors.borderSubtle;

    const dot3 = document.createElement('span');
    dot3.className = 'swatch-dot';
    dot3.style.backgroundColor = palette.colors.accentPrimary;

    swatches.appendChild(dot1);
    swatches.appendChild(dot2);
    swatches.appendChild(dot3);

    card.appendChild(info);
    card.appendChild(swatches);

    card.addEventListener('click', () => {
      themeState.paletteId = palette.id;
      themeState.customAccent = null;
      if (inputCustomAccent) {
        inputCustomAccent.value = palette.colors.accentPrimary;
      }
      applyPalette(palette, null);
      renderPalettePickerGrid();
    });

    palettePickerGrid.appendChild(card);
  });

  // Update mode buttons
  if (btnModeDark && btnModeLight) {
    btnModeDark.classList.toggle('active', themeState.mode === 'dark');
    btnModeLight.classList.toggle('active', themeState.mode === 'light');
  }

  // Update custom accent input color
  if (inputCustomAccent) {
    const activePalette = palettes.find(p => p.id === themeState.paletteId) || palettes[0];
    inputCustomAccent.value = themeState.customAccent || activePalette.colors.accentPrimary;
  }
}

function switchThemeMode(mode) {
  themeState.mode = mode;
  const palettes = mode === 'dark' ? DARK_PALETTES : LIGHT_PALETTES;
  const newPalette = palettes[0];
  themeState.paletteId = newPalette.id;
  themeState.customAccent = null;

  applyPalette(newPalette, null);
  renderPalettePickerGrid();
}

function handleCustomAccentChange(e) {
  const color = e.target.value;
  themeState.customAccent = color;
  const palettes = themeState.mode === 'dark' ? DARK_PALETTES : LIGHT_PALETTES;
  const activePalette = palettes.find(p => p.id === themeState.paletteId) || palettes[0];
  applyPalette(activePalette, color);
}

function handleSaveName(e) {
  e.preventDefault();
  const newName = inputEditUsername.value.trim();
  if (newName) {
    saveUsername(newName);
    currentUsername = newName;
    updateUserUI();
    updateProfile({
      name: newName,
      color: getAvatarColor(newName),
      avatar: currentAvatar
    });
    updatePeersList();
  }
  closeEditNameModal();
}

/**
 * Video Player Controls
 */
function toggleMute() {
  remoteVideo.muted = !remoteVideo.muted;
  updateVolumeUI();
}

function handleVolumeChange(e) {
  const val = parseFloat(e.target.value);
  remoteVideo.volume = val;
  remoteVideo.muted = val === 0;
  updateVolumeUI();
}

function updateVolumeUI() {
  const isMuted = remoteVideo.muted || remoteVideo.volume === 0;
  iconVolumeHigh.classList.toggle('hidden', isMuted);
  iconVolumeMuted.classList.toggle('hidden', !isMuted);
  volumeSlider.value = isMuted ? 0 : remoteVideo.volume;
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    videoWrapper.requestFullscreen().catch((err) => {
      console.warn('Fullscreen error:', err);
    });
  } else {
    document.exitFullscreen().catch((err) => {
      console.warn('Exit fullscreen error:', err);
    });
  }
}

function updateFullscreenIcons() {
  const isFs = Boolean(document.fullscreenElement);
  iconFsEnter.classList.toggle('hidden', isFs);
  iconFsExit.classList.toggle('hidden', !isFs);
}

function toggleFitMode() {
  remoteVideo.classList.toggle('cover-mode');
}

async function togglePip() {
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else if (remoteVideo.srcObject) {
      await remoteVideo.requestPictureInPicture();
    }
  } catch (err) {
    console.warn('PiP error:', err);
  }
}

/**
 * Sidebar and Tabs
 */
function switchTab(tab) {
  if (tab === 'chat') {
    tabChat.classList.add('active');
    tabParticipants.classList.remove('active');
    panelChat.classList.remove('hidden');
    panelParticipants.classList.add('hidden');
  } else {
    tabChat.classList.remove('active');
    tabParticipants.classList.add('active');
    panelChat.classList.add('hidden');
    panelParticipants.classList.remove('hidden');
  }
}

function toggleChatSidebar() {
  const isOpen = chatSidebar.classList.contains('mobile-open');
  setSidebarOpen(!isOpen);
}

function setSidebarOpen(open) {
  if (open) {
    chatSidebar.classList.add('mobile-open');
    chatManager.setChatOpen(true);
  } else {
    chatSidebar.classList.remove('mobile-open');
    chatManager.setChatOpen(false);
  }
}

// Start
initApp();
