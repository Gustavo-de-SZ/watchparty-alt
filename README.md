# 🎬 WatchParty P2P

> **Serverless Peer-to-Peer Screensharing & Chat Web App**  
> 100% Static HTML/JS. Zero backend server required. Built specifically for **GitHub Pages**.

WatchParty P2P enables up to 3+ participants to watch a host's screen share in real-time with synchronized audio/video, low-latency WebRTC data channels, and live text chat.

---

## ✨ Features

- **📺 Low-Latency Screen Sharing with Audio**:
  - Full screen, individual application window, or browser tab streaming.
  - Synchronized audio and video (WebRTC native RTP synchronization).
  - Compatible with **Windows** and **Linux** (both **X11** and **Wayland** via PipeWire / `xdg-desktop-portal`).
- **📱 Android Friendly Viewing**:
  - Mobile users join as **viewers & chatters** (mobile UI automatically hides host controls for a clean watching experience).
  - Handles mobile autoplay audio restrictions via a responsive **"Tap to Unmute"** overlay.
  - Native **Fullscreen** button (`requestFullscreen`) for edge-to-edge landscape viewing.
  - Slide-over mobile chat drawer with unread message counter badge.
- **💬 Real-Time Text Chat & Custom Nicknames**:
  - Peer-to-peer WebRTC DataChannels (direct browser-to-browser messaging).
  - Custom display names persisted in `localStorage`.
  - Automatic system announcements (*"Alice joined"*, *"Bob started sharing screen"*).
  - Live round-trip latency indicator (`ms`).
- **🌐 100% Serverless & GitHub Pages Ready**:
  - WebRTC signaling powered by decentralized public **Nostr relays** + **Google STUN** servers.
  - No custom backend server, database, or API keys needed.
  - Works on root domains or repository subpaths (`username.github.io/repo/`).

---

## 🚀 How to Deploy on GitHub Pages

1. **Push this repository to GitHub**:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin master
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub.
   - Click **Settings** ➔ **Pages** (under "Code and automation").
   - Under **Build and deployment** ➔ **Source**, select **GitHub Actions**.

3. **Enjoy your live site**:
   - The included workflow in `.github/workflows/deploy.yml` will automatically build the site and deploy it to `https://<your-username>.github.io/<your-repo-name>/`.
   - Any future commits pushed to `master` or `main` will automatically trigger an update!

---

## 💻 Local Development & Testing

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)

### 2. Install & Run Dev Server
```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

### 3. Build & Preview Production Bundle
```bash
npm run build
npm run preview
```

---

## 🖥️ Platform Guidance

### Windows Hosts
- When clicking **Share Screen**, you can share your entire screen, an application, or a Chrome/Edge browser tab.
- To share audio (e.g. YouTube, media players, or games), check the **"Share tab audio"** or **"Share system audio"** checkbox in the browser picker dialog.

### Linux Hosts (X11 & Wayland)
- **Wayland**: Supported out-of-the-box via Chromium / Firefox desktop portal integration (`xdg-desktop-portal` + PipeWire). The system portal dialog will let you pick monitors or windows.
- **X11**: Supported natively in all modern desktop browsers.

### Android Viewers
- Open the shared party link (e.g. `https://your-site/#room=party-xyz`).
- Mobile browsers restrict unmuted autoplay without user interaction. When the host begins streaming, an orange **"Tap to Unmute Audio"** badge will appear—tap it once to start listening.
- Tap the **Fullscreen** button on the video player and rotate your device to landscape for full theater experience!

---

## 🛠️ Architecture Overview

```
                         ┌────────────────────────────────────────┐
                         │       GitHub Pages (Static Web)        │
                         │        Vite + Vanilla JS + CSS         │
                         └───────────────────┬────────────────────┘
                                             │
                       ┌─────────────────────┴────────────────────┐
                       │   Decentralized WebRTC Signaling         │
                       │ (Public Nostr Relays + Google STUN)      │
                       └─────────┬───────────┬───────────┬────────┘
                                 │           │           │
              Offer / Answer / ICE           │           │
                                 ▼           ▼           ▼
                      ┌──────────────┐   ┌─────────┐   ┌─────────┐
                      │ Host         │   │ Peer 2  │   │ Peer 3  │
                      │ (Win/Wayland)│◄─►│ (Linux/ │◄─►│(Android)│
                      │ Screenshare  │   │ Windows)│   │ Viewer  │
                      └──────────────┘   └─────────┘   └─────────┘
                             ▲                ▲             ▲
                             └─────── Full-Mesh P2P ────────┘
                              - Screen Video + Audio Stream
                              - WebRTC DataChannel (Chat)
```

---

## 📄 License
MIT License. Feel free to use and customize!
