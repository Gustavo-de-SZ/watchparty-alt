import {
  initRoom,
  sendChatMessage,
  updateProfile,
  leaveRoom,
  getSelfId,
  getPeers,
  getLocalProfile
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

// DOM Elements
const modalLobby = document.getElementById('modal-lobby');
const modalEditName = document.getElementById('modal-edit-name');
const inputUsername = document.getElementById('input-username');
const inputEditUsername = document.getElementById('input-edit-username');
const inputRoomCode = document.getElementById('input-room-code');
const btnCreateRoom = document.getElementById('btn-create-room');
const btnJoinRoom = document.getElementById('btn-join-room');

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
let activePresenterId = null;
let chatManager = null;
const isMobile = isMobileDevice();

// Initialize App
function initApp() {
  updateUserUI();

  // Initialize Chat Manager
  chatManager = new ChatManager({
    messagesContainer: chatMessages,
    unreadBadgeElement: chatUnreadBadge,
    onNewMessage: () => {
      // Message received
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
  userAvatar.textContent = currentUsername.charAt(0).toUpperCase();
  userAvatar.style.backgroundColor = getAvatarColor(currentUsername);
}

function setupEventListeners() {
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
  document.getElementById('btn-cancel-edit-name').addEventListener('click', closeEditNameModal);
  document.getElementById('form-edit-name').addEventListener('submit', handleSaveName);

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
      chatManager.addMessage(msg, true);
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
 * Connect to room via WebRTC
 */
function joinPartyRoom(roomId) {
  currentRoomId = roomId;
  window.location.hash = `room=${roomId}`;

  // Update Header UI
  roomCodeDisplay.textContent = roomId;
  roomInfoBadge.classList.remove('hidden');
  latencyIndicator.classList.remove('hidden');
  btnTogglePeers.classList.remove('hidden');
  btnLeaveRoom.classList.remove('hidden');
  modalLobby.classList.add('hidden');

  // Initialize Room
  initRoom({
    roomId,
    profile: {
      name: currentUsername,
      role: 'viewer',
      color: getAvatarColor(currentUsername)
    },
    onPeerJoin: (peerId, peer) => {
      chatManager.addSystemMessage(`${peer.name || 'A user'} joined the party`);
      updatePeersList();
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
      chatManager.addMessage(message, false);
    },
    onProfileUpdate: () => {
      updatePeersList();
    },
    onPingUpdate: (peerId, latency) => {
      latencyText.textContent = `${latency} ms`;
    },
    onError: (err) => {
      console.error('Room connection error:', err);
      chatManager.addSystemMessage(`Connection error: ${err.message || 'Relay issue'}`);
    }
  });

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
 * Update participants list and badges
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
      isSelf: false,
      isHost: isPeerHost,
      latency: peer.latency
    });
    participantsList.appendChild(item);
  });
}

function createParticipantItem({ name, color, isSelf, isHost, latency }) {
  const el = document.createElement('div');
  el.className = 'participant-item';

  const info = document.createElement('div');
  info.className = 'participant-info';

  const avatar = document.createElement('span');
  avatar.className = 'chat-avatar';
  avatar.style.backgroundColor = color;
  avatar.textContent = name.charAt(0).toUpperCase();

  const nameSpan = document.createElement('span');
  nameSpan.className = 'participant-name';
  nameSpan.textContent = isSelf ? `${name} (You)` : name;

  info.appendChild(avatar);
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
 * Edit Name Modal
 */
function openEditNameModal() {
  inputEditUsername.value = currentUsername;
  modalEditName.classList.remove('hidden');
  inputEditUsername.focus();
}

function closeEditNameModal() {
  modalEditName.classList.add('hidden');
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
      color: getAvatarColor(newName)
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
