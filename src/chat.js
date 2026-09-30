const STORAGE_KEY_NAME = 'watchparty_username';

const AVATAR_COLORS = [
  '#f87171', '#fb923c', '#fbbf24', '#34d399', '#2dd4bf',
  '#38bdf8', '#818cf8', '#a78bfa', '#f472b6', '#fb7185'
];

/**
 * Generate a consistent color based on a string name
 */
export function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

/**
 * Get stored username or generate a friendly default
 */
export function getStoredUsername() {
  const saved = localStorage.getItem(STORAGE_KEY_NAME);
  if (saved && saved.trim()) {
    return saved.trim();
  }
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `Viewer-${randomNum}`;
}

/**
 * Save username to localStorage
 */
export function saveUsername(name) {
  const cleanName = (name || '').trim();
  if (cleanName) {
    localStorage.setItem(STORAGE_KEY_NAME, cleanName);
  }
  return cleanName;
}

/**
 * Format timestamp into HH:MM AM/PM
 */
export function formatTime(timestamp) {
  const date = new Date(timestamp || Date.now());
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Create a DOM node for a chat message safely without innerHTML XSS vulnerabilities
 */
export function createChatMessageElement(message, isSelf = false) {
  const item = document.createElement('div');
  item.className = `chat-message ${isSelf ? 'chat-message-self' : ''} ${message.isSystem ? 'chat-message-system' : ''}`;
  item.dataset.id = message.id;

  if (message.isSystem) {
    const textSpan = document.createElement('span');
    textSpan.className = 'chat-system-text';
    textSpan.textContent = message.text;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'chat-time';
    timeSpan.textContent = formatTime(message.timestamp);

    item.appendChild(textSpan);
    item.appendChild(timeSpan);
    return item;
  }

  const header = document.createElement('div');
  header.className = 'chat-header';

  const avatar = document.createElement('span');
  avatar.className = 'chat-avatar';
  avatar.style.backgroundColor = message.senderColor || getAvatarColor(message.senderName || 'Anonymous');
  avatar.textContent = (message.senderName || '?').charAt(0).toUpperCase();

  const author = document.createElement('span');
  author.className = 'chat-author';
  author.textContent = isSelf ? `${message.senderName} (You)` : message.senderName;
  author.style.color = message.senderColor || getAvatarColor(message.senderName || 'Anonymous');

  const time = document.createElement('span');
  time.className = 'chat-time';
  time.textContent = formatTime(message.timestamp);

  header.appendChild(avatar);
  header.appendChild(author);
  header.appendChild(time);

  const body = document.createElement('div');
  body.className = 'chat-body';
  body.textContent = message.text;

  item.appendChild(header);
  item.appendChild(body);

  return item;
}

/**
 * Chat state manager
 */
export class ChatManager {
  constructor({ messagesContainer, unreadBadgeElement, onNewMessage }) {
    this.container = messagesContainer;
    this.badge = unreadBadgeElement;
    this.onNewMessage = onNewMessage;
    this.unreadCount = 0;
    this.isChatOpen = true;
    this.messages = [];
  }

  setChatOpen(isOpen) {
    this.isChatOpen = isOpen;
    if (isOpen) {
      this.unreadCount = 0;
      this.updateBadge();
      this.scrollToBottom();
    }
  }

  addMessage(msg, isSelf = false) {
    this.messages.push(msg);

    if (this.container) {
      const el = createChatMessageElement(msg, isSelf);
      this.container.appendChild(el);
      this.scrollToBottom();
    }

    if (!this.isChatOpen && !isSelf && !msg.isSystem) {
      this.unreadCount++;
      this.updateBadge();
    }

    if (this.onNewMessage) {
      this.onNewMessage(msg, isSelf);
    }
  }

  addSystemMessage(text) {
    const sysMsg = {
      id: `sys-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text,
      timestamp: Date.now(),
      isSystem: true
    };
    this.addMessage(sysMsg, false);
  }

  updateBadge() {
    if (!this.badge) return;
    if (this.unreadCount > 0) {
      this.badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
      this.badge.classList.remove('hidden');
    } else {
      this.badge.textContent = '0';
      this.badge.classList.add('hidden');
    }
  }

  scrollToBottom() {
    if (this.container) {
      this.container.scrollTop = this.container.scrollHeight;
    }
  }

  clear() {
    this.messages = [];
    this.unreadCount = 0;
    this.updateBadge();
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
