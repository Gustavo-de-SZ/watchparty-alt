import { joinRoom, selfId } from '@trystero-p2p/nostr';

const APP_ID = 'watchparty-p2p-v1';

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' }
  ]
};

// Top reliable public Nostr relays for WebRTC signaling
const NOSTR_RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.primal.net',
  'wss://nostr.mom',
  'wss://nostr-01.yakihonne.com',
  'wss://relay.current.fyi'
];

let currentRoom = null;
let currentRoomId = null;
let activeStream = null;
let pingInterval = null;
const peers = new Map(); // peerId -> { name, role, color, avatar, latency }

let chatAction = null;
let profileAction = null;
let streamStateAction = null;
let historyAction = null;

let localProfile = {
  name: 'Anonymous',
  role: 'viewer', // 'host' or 'viewer'
  color: '#38bdf8',
  avatar: 'avatar-popcorn'
};

/**
 * Initialize and join a P2P room
 */
export function initRoom({
  roomId,
  profile,
  onPeerJoin,
  onPeerLeave,
  onStream,
  onChatMessage,
  onProfileUpdate,
  onPingUpdate,
  onStreamState,
  onHistoryRequest,
  onHistoryResponse,
  onError
}) {
  if (currentRoom) {
    leaveRoom();
  }

  currentRoomId = roomId;
  if (profile) {
    localProfile = { ...localProfile, ...profile };
  }

  try {
    currentRoom = joinRoom(
      {
        appId: APP_ID,
        rtcConfig: RTC_CONFIG,
        relayUrls: NOSTR_RELAYS
      },
      roomId
    );

    // Register DataChannel Actions
    chatAction = currentRoom.makeAction('chat');
    profileAction = currentRoom.makeAction('profile');
    streamStateAction = currentRoom.makeAction('stream-state');
    historyAction = currentRoom.makeAction('chat-history');

    // Handle incoming chat messages
    chatAction.onMessage = (data, { peerId } = {}) => {
      if (onChatMessage) {
        onChatMessage({
          ...data,
          peerId
        });
      }
    };

    // Handle P2P Chat History Sync (Anti-Entropy)
    historyAction.onMessage = (data, { peerId } = {}) => {
      if (!data) return;

      if (data.type === 'sync-request' && onHistoryRequest) {
        onHistoryRequest({
          since: data.since || 0,
          roomId: data.roomId
        }, peerId);
      } else if (data.type === 'sync-response' && onHistoryResponse) {
        onHistoryResponse(data.messages || [], peerId);
      }
    };

    // Handle incoming profile announcements
    profileAction.onMessage = (data, { peerId } = {}) => {
      const existing = peers.get(peerId) || {};
      const updated = { ...existing, ...data, peerId };
      peers.set(peerId, updated);

      if (onProfileUpdate) {
        onProfileUpdate(peerId, updated);
      }
    };

    // Handle incoming stream state changes (host started/stopped sharing)
    streamStateAction.onMessage = (data, { peerId } = {}) => {
      if (onStreamState) {
        onStreamState(data, peerId);
      }
    };

    // Handle peer connection
    currentRoom.onPeerJoin = (peerId) => {
      peers.set(peerId, {
        peerId,
        name: `User-${peerId.slice(0, 4)}`,
        role: 'viewer',
        color: '#94a3b8',
        avatar: 'avatar-popcorn',
        latency: null
      });

      // Send local profile to new peer
      profileAction.send(localProfile, { target: peerId });

      // If we are currently sharing a stream, notify the new peer
      if (activeStream) {
        streamStateAction.send({ isSharing: true, hostId: selfId }, { target: peerId });
      }

      if (onPeerJoin) {
        onPeerJoin(peerId, peers.get(peerId));
      }
    };

    // Handle peer disconnect
    currentRoom.onPeerLeave = (peerId) => {
      const peer = peers.get(peerId);
      peers.delete(peerId);

      if (onPeerLeave) {
        onPeerLeave(peerId, peer);
      }
    };

    // Handle incoming media stream (screenshare)
    currentRoom.onPeerStream = (stream, peerId, metadata) => {
      if (onStream) {
        onStream(stream, peerId, metadata);
      }
    };

    // Start periodic ping measurement
    startPingMonitor((peerId, latency) => {
      const peer = peers.get(peerId);
      if (peer) {
        peer.latency = latency;
      }
      if (onPingUpdate) {
        onPingUpdate(peerId, latency);
      }
    });

    return {
      selfId,
      roomId
    };
  } catch (err) {
    console.error('Failed to initialize P2P room:', err);
    if (onError) onError(err);
    throw err;
  }
}

/**
 * Send a chat message to all peers in room
 */
export function sendChatMessage(text) {
  if (!chatAction || !text.trim()) return null;

  const message = {
    id: `msg-${Date.now()}-${selfId.slice(0, 5)}-${Math.random().toString(36).slice(2, 6)}`,
    roomId: currentRoomId,
    text: text.trim(),
    senderId: selfId,
    senderName: localProfile.name,
    senderColor: localProfile.color,
    senderAvatar: localProfile.avatar,
    timestamp: Date.now()
  };

  // Broadcast to peers
  chatAction.send(message);

  return message;
}

/**
 * Send a history catch-up request to peers
 */
export function requestHistoryFromPeers(sinceTimestamp = 0) {
  if (!historyAction || !currentRoom) return;

  historyAction.send({
    type: 'sync-request',
    roomId: currentRoomId,
    since: sinceTimestamp
  });
}

/**
 * Send history delta to a specific peer
 */
export function sendHistoryDelta(peerId, messages) {
  if (!historyAction || !currentRoom || !messages) return;

  historyAction.send({
    type: 'sync-response',
    roomId: currentRoomId,
    messages
  }, { target: peerId });
}

/**
 * Update local user profile and broadcast to peers
 */
export function updateProfile(updates) {
  localProfile = { ...localProfile, ...updates };
  if (profileAction) {
    profileAction.send(localProfile);
  }
}

/**
 * Broadcast screenshare stream to peers
 */
export function broadcastStream(stream) {
  if (!currentRoom) return;

  activeStream = stream;
  localProfile.role = 'host';
  updateProfile({ role: 'host' });

  // Add stream to all peers
  currentRoom.addStream(stream);

  // Notify peers that sharing has started
  if (streamStateAction) {
    streamStateAction.send({ isSharing: true, hostId: selfId });
  }
}

/**
 * Stop broadcasting stream
 */
export function stopBroadcastingStream() {
  if (!currentRoom || !activeStream) return;

  try {
    currentRoom.removeStream(activeStream);
  } catch (e) {
    console.warn('Error removing stream from room:', e);
  }

  activeStream = null;
  localProfile.role = 'viewer';
  updateProfile({ role: 'viewer' });

  if (streamStateAction) {
    streamStateAction.send({ isSharing: false, hostId: selfId });
  }
}

/**
 * Periodic ping loop
 */
function startPingMonitor(onPing) {
  stopPingMonitor();
  pingInterval = setInterval(async () => {
    if (!currentRoom) return;
    for (const peerId of peers.keys()) {
      try {
        const latency = await currentRoom.ping(peerId);
        if (typeof latency === 'number' && onPing) {
          onPing(peerId, Math.round(latency));
        }
      } catch {
        // Peer might be busy or reconnecting
      }
    }
  }, 4000);
}

function stopPingMonitor() {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }
}

/**
 * Leave room and clean up resources
 */
export function leaveRoom() {
  stopPingMonitor();

  if (activeStream) {
    stopBroadcastingStream();
  }

  if (currentRoom) {
    try {
      currentRoom.leave();
    } catch (e) {
      console.warn('Error leaving room:', e);
    }
    currentRoom = null;
  }

  currentRoomId = null;
  chatAction = null;
  profileAction = null;
  streamStateAction = null;
  historyAction = null;
  peers.clear();
}

export function getSelfId() {
  return selfId;
}

export function getPeers() {
  return Array.from(peers.values());
}

export function getLocalProfile() {
  return { ...localProfile, selfId };
}
