const DB_NAME = 'WatchPartyDB';
const DB_VERSION = 1;

let dbInstance = null;

/**
 * Open or initialize the IndexedDB database
 */
export function initDB() {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Messages Store
      if (!db.objectStoreNames.contains('messages')) {
        const msgStore = db.createObjectStore('messages', { keyPath: 'id' });
        msgStore.createIndex('roomId', 'roomId', { unique: false });
        msgStore.createIndex('timestamp', 'timestamp', { unique: false });
        msgStore.createIndex('room_timestamp', ['roomId', 'timestamp'], { unique: false });
      }

      // Preferences Store
      if (!db.objectStoreNames.contains('preferences')) {
        db.createObjectStore('preferences', { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Save a single message into IndexedDB (idempotent: put replaces existing id)
 */
export async function saveMessage(message) {
  if (!message || !message.id) return;
  return saveMessages([message]);
}

/**
 * Batch save an array of messages into IndexedDB
 */
export async function saveMessages(messages) {
  if (!messages || messages.length === 0) return;
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('messages', 'readwrite');
    const store = tx.objectStore('messages');

    for (const msg of messages) {
      if (msg && msg.id) {
        store.put(msg);
      }
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => {
      console.warn('Error saving messages to IndexedDB:', tx.error);
      reject(tx.error);
    };
  });
}

/**
 * Get all messages for a room with timestamp > sinceTimestamp, sorted chronologically
 */
export async function getRoomMessages(roomId, sinceTimestamp = 0) {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('messages', 'readonly');
    const store = tx.objectStore('messages');
    const index = store.index('room_timestamp');

    // Query messages in this room strictly newer than sinceTimestamp
    const lowerBound = [roomId, sinceTimestamp + 1];
    const upperBound = [roomId, Infinity];
    const range = IDBKeyRange.bound(lowerBound, upperBound);

    const request = index.getAll(range);

    request.onsuccess = () => {
      const results = request.result || [];
      // Ensure sorted by timestamp ascending
      results.sort((a, b) => a.timestamp - b.timestamp);
      resolve(results);
    };

    request.onerror = () => {
      console.warn('Error querying room messages from IndexedDB:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Get the latest timestamp of stored messages in a room
 */
export async function getLatestMessageTimestamp(roomId) {
  const db = await initDB();

  return new Promise((resolve) => {
    const tx = db.transaction('messages', 'readonly');
    const store = tx.objectStore('messages');
    const index = store.index('room_timestamp');

    const lowerBound = [roomId, 0];
    const upperBound = [roomId, Infinity];
    const range = IDBKeyRange.bound(lowerBound, upperBound);

    // Open cursor in reverse order to get newest item immediately
    const request = index.openCursor(range, 'prev');

    request.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor && cursor.value && cursor.value.timestamp) {
        resolve(cursor.value.timestamp);
      } else {
        resolve(0);
      }
    };

    request.onerror = () => resolve(0);
  });
}

/**
 * Save user preference
 */
export async function setPreference(key, value) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('preferences', 'readwrite');
    const store = tx.objectStore('preferences');
    store.put({ key, value });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Get user preference
 */
export async function getPreference(key, defaultValue = null) {
  const db = await initDB();
  return new Promise((resolve) => {
    const tx = db.transaction('preferences', 'readonly');
    const store = tx.objectStore('preferences');
    const request = store.get(key);

    request.onsuccess = () => {
      if (request.result && request.result.value !== undefined) {
        resolve(request.result.value);
      } else {
        resolve(defaultValue);
      }
    };

    request.onerror = () => resolve(defaultValue);
  });
}
