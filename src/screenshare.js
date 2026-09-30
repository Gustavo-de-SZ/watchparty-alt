import { broadcastStream, stopBroadcastingStream } from './webrtc.js';

let localMediaStream = null;

/**
 * Check if the browser is running on a mobile device
 */
export function isMobileDevice() {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
    (navigator.maxTouchPoints > 1 && window.innerWidth <= 800);
}

/**
 * Check if screensharing capture is supported in this browser
 */
export function canShareScreen() {
  // Mobile users are viewers only
  if (isMobileDevice()) {
    return false;
  }
  return Boolean(navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === 'function');
}

/**
 * Start screen sharing with system/tab audio
 */
export async function startScreenShare({ onEnded, onError } = {}) {
  if (!canShareScreen()) {
    throw new Error('Screen sharing is not supported or disabled on this device.');
  }

  // If already sharing, stop previous first
  if (localMediaStream) {
    stopScreenShare();
  }

  try {
    // getDisplayMedia constraints for high quality 1080p/720p 30-60fps screenshare with audio
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: 'always',
        frameRate: { ideal: 30, max: 60 },
        width: { max: 1920 },
        height: { max: 1080 }
      },
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }
    });

    localMediaStream = stream;

    // Detect when host stops sharing via native browser bar (e.g. Chrome/Firefox "Stop sharing")
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.addEventListener('ended', () => {
        stopScreenShare();
        if (onEnded) onEnded();
      });
    }

    // Broadcast stream to WebRTC peers
    broadcastStream(stream);

    return stream;
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      console.log('User canceled screen share picker.');
      return null;
    }
    console.error('Screen sharing error:', err);
    if (onError) onError(err);
    throw err;
  }
}

/**
 * Stop screen sharing and clean up tracks
 */
export function stopScreenShare() {
  if (localMediaStream) {
    localMediaStream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch (e) {
        console.warn('Error stopping track:', e);
      }
    });
    localMediaStream = null;
  }

  stopBroadcastingStream();
}

/**
 * Attach stream to a video element with mobile-friendly autoplay and audio handling
 */
export async function attachStreamToVideo(videoElement, stream, onAutoplayBlocked) {
  if (!videoElement) return;

  videoElement.srcObject = stream;
  videoElement.playsInline = true;

  try {
    await videoElement.play();
  } catch (err) {
    console.warn('Autoplay with audio blocked by browser policy:', err);
    // If autoplay was blocked (common on Android Chrome), mute video and retry
    videoElement.muted = true;
    try {
      await videoElement.play();
      if (onAutoplayBlocked) {
        onAutoplayBlocked();
      }
    } catch (e) {
      console.error('Even muted playback failed:', e);
    }
  }
}

/**
 * Detach stream from video element
 */
export function detachStreamFromVideo(videoElement) {
  if (!videoElement) return;
  videoElement.srcObject = null;
}

export function isCurrentlySharing() {
  return Boolean(localMediaStream && localMediaStream.active);
}
