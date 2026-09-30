const STORAGE_KEY_AVATAR = 'watchparty_avatar';

export const PRESET_AVATARS = [
  {
    id: 'avatar-popcorn',
    name: 'Popcorn',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 6c0-1.66 1.34-3 3-3 .55 0 1.05.15 1.5.41.45-.26.95-.41 1.5-.41 1.66 0 3 1.34 3 3 0 .35-.06.68-.17.99.7.35 1.17 1.08 1.17 1.91 0 1.2-.98 2.18-2.18 2.18-.32 0-.62-.07-.9-.2-.37.72-1.12 1.2-1.98 1.2s-1.61-.48-1.98-1.2c-.28.13-.58.2-.9.2-1.2 0-2.18-.98-2.18-2.18 0-.83.47-1.56 1.17-1.91-.11-.31-.17-.64-.17-.99zM6 13l1.5 8h9l1.5-8H6z" fill="#f59e0b"/></svg>`
  },
  {
    id: 'avatar-robot',
    name: 'Robot',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.38-1 1.72V7h4a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4V5.72A2.001 2.001 0 0 1 12 2M7.5 12a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m9 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M9 15h6v1H9z" fill="#38bdf8"/></svg>`
  },
  {
    id: 'avatar-astronaut',
    name: 'Astronaut',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a9 9 0 0 0-9 9c0 3.58 2.1 6.67 5.16 8.11L7.5 21h9l-.66-1.89C18.9 17.67 21 14.58 21 11a9 9 0 0 0-9-9zm0 3.5c3.59 0 6.5 2.46 6.5 5.5s-2.91 5.5-6.5 5.5-6.5-2.46-6.5-5.5 2.91-5.5 6.5-5.5z" fill="#818cf8"/></svg>`
  },
  {
    id: 'avatar-cat',
    name: 'Cool Cat',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4c-4.42 0-8 3.58-8 8 0 2.22.9 4.23 2.36 5.68L4 21l3.32-2.36C8.77 19.46 10.33 20 12 20c4.42 0 8-3.58 8-8s-3.58-8-8-8zm-4 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm8 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-4 7c-1.66 0-3-1-3-2h6c0 1-1.34 2-3 2z" fill="#f472b6"/></svg>`
  },
  {
    id: 'avatar-ninja',
    name: 'Ninja',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm6 8.5H6c-.55 0-1-.45-1-1s.45-1 1-1h12c.55 0 1 .45 1 1s-.45 1-1 1zm-8 4c-.83 0-1.5-.67-1.5-1.5S9.17 11.5 10 11.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="#34d399"/></svg>`
  },
  {
    id: 'avatar-gamepad',
    name: 'Gamer',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H9v2H7v-2H5v-2h2V9h2v2h2v2zm4.5 1.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3-3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="#a78bfa"/></svg>`
  },
  {
    id: 'avatar-film',
    name: 'Film Reel',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" fill="#fb7185"/></svg>`
  },
  {
    id: 'avatar-alien',
    name: 'Alien',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12c0 3.8 2.1 7.1 5.3 8.7L10 22h4l2.7-1.3C19.9 19.1 22 15.8 22 12c0-5.5-4.5-10-10-10zm-3 12c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm6 0c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" fill="#2dd4bf"/></svg>`
  }
];

/**
 * Get stored avatar choice (preset ID, data URL, or null)
 */
export function getStoredAvatar() {
  return localStorage.getItem(STORAGE_KEY_AVATAR) || 'avatar-popcorn';
}

/**
 * Save avatar choice
 */
export function saveStoredAvatar(avatar) {
  if (avatar) {
    localStorage.setItem(STORAGE_KEY_AVATAR, avatar);
  }
}

/**
 * Compress an uploaded image file into an 80x80 thumbnail data URL
 */
export function compressImageToDataURL(file, maxSize = 80, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image.'));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Square center crop
        const minDim = Math.min(width, height);
        const startX = (width - minDim) / 2;
        const startY = (height - minDim) / 2;

        canvas.width = maxSize;
        canvas.height = maxSize;

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw cropped & scaled
        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, maxSize, maxSize);

        // Convert to WebP (fallback to JPEG)
        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to decode image file.'));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Render avatar into a container element
 */
export function renderAvatarInto(container, avatarIdOrDataUrl, fallbackName = '?', fallbackColor = '#6366f1') {
  if (!container) return;
  container.innerHTML = '';

  if (avatarIdOrDataUrl && avatarIdOrDataUrl.startsWith('data:image/')) {
    const img = document.createElement('img');
    img.src = avatarIdOrDataUrl;
    img.alt = fallbackName;
    img.className = 'avatar-custom-img';
    container.appendChild(img);
    return;
  }

  const preset = PRESET_AVATARS.find(p => p.id === avatarIdOrDataUrl);
  if (preset) {
    container.innerHTML = preset.svg;
    return;
  }

  // Fallback: Initial letter on colored background
  container.style.backgroundColor = fallbackColor;
  container.textContent = fallbackName.charAt(0).toUpperCase();
}
