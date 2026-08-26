# LostNote

> *"Write it before you lose it."*

[![Platform](https://img.shields.io/badge/Android%20%2B%20Windows-native-6D28D9?style=for-the-badge&logo=android&logoColor=white)](https://github.com/rkkizar777-design/lostnote/releases/latest)
[![Offline](https://img.shields.io/badge/Works-100%25%20offline-10B981?style=for-the-badge&logo=wifi&logoColor=white)](#)
[![Servers](https://img.shields.io/badge/Servers-zero-black?style=for-the-badge)](#)
[![Tracking](https://img.shields.io/badge/Tracking-zero-black?style=for-the-badge)](#)
[![Follow](https://img.shields.io/badge/Follow-%40rkkizar777--design-white?style=for-the-badge&logo=github&logoColor=black)](https://github.com/rkkizar777-design)

A notes app that lives **entirely on your device** — photos, colors, PDF export, a locked archive, and direct phone ↔ PC sync with no server in between.

---

## 📥 Download

| Platform | Link | Size |
|---|---|---|
| 📱 **Android** (APK) | [LostNote.apk](https://github.com/rkkizar777-design/lostnote/releases/latest/download/LostNote.apk) | ~3 MB |
| 💻 **Windows** (portable, no install) | [LostNote.exe](https://github.com/rkkizar777-design/lostnote/releases/latest/download/LostNote.exe) | ~89 MB |

Install → open → write. That's the whole onboarding.

---

## ✨ What it does

- 🎨 **8 glass-tint colors** — whole-card tinting, not just a dot
- 🖼️ **Photos** — camera or gallery, tap to fullscreen
- 🔒 **PIN lock** — optional 4-digit lock, plus a *second* PIN for the archive
- 🗄️ **Archive** — hide notes without deleting them
- 🗑️ **Trash with undo** — nothing vanishes by accident
- 🏷️ **Tags + tag filter chips**
- 📤 **Share as image** — any note becomes a beautiful card
- 📄 **PDF export** — all notes to one printable file
- 💾 **Backup / restore** — one JSON file, everything included
- 🌗 **Dark · Light · Auto theme** — OLED black by default
- 🔄 **P2P transfer** — send your entire library to another device with a 5-digit code. Direct when possible, relayed through an encrypted tunnel when networks are hostile. Archive and trash arrive exactly as they left.
- 👆 **Built for thumbs** — long-press to delete, one-thumb editor, desktop layout for big screens
- 🚀 **In-app updates** — check and download new versions from inside the app, no browser needed
- ⚡ **Optimized PC build** — GPU disabled, startup flags tuned, dead weight stripped, window appears instantly when ready

## ⚙️ How it works

- 🧠 **Zero backend** — IndexedDB is the database, the device is the server
- 📡 **PeerJS + WebRTC** — encrypted data channels; TURN fallback punches through firewalls and carrier NATs automatically
- 🪞 **Mirror merge** — newest `updatedAt` wins, deletions propagate, no duplicates ever
- 📦 **One codebase, two shells** — plain web app wrapped natively: Capacitor for Android, Electron portable for Windows (`lostnote://` secure origin)
- 🚀 **Single-file EXE** — self-contained, runs from a USB stick if you want
- ⚙️ **Lightweight startup** — `--no-sandbox`, GPU disabled, renderer capped, Chromium services stripped; fastest possible launch for a notes app
- 🎬 **Splash intro** — guaranteed 2.4s brand moment, skippable, theme-aware

**Notes stored** · **on your device**
**Accounts needed** · **none**
**Data collected** · **nothing**

---

## 🛠️ Tech Stack

`JavaScript` `HTML5` `CSS3` `IndexedDB` `WebRTC` `PeerJS` `Canvas` `Capacitor 6` `Electron` `Gradle` `electron-builder`

---

## 🧑‍💻 Run from source

```bash
# any static server works
npx serve .        # or: node serve.mjs
```

Open the printed URL — full app, no build step, no dependencies to install.

Rebuild the Android APK / Windows EXE from `source/` with Capacitor 6 + electron-builder.

---

## 📜 Privacy

No servers. No accounts. No analytics. No tracking pixels. No permissions beyond what you grant.
Your notes leave your device only when *you* push Transfer — straight to the other device, peer to peer.

---

### 🌍 Find Me

**Portfolio** · [kizar.dev](https://portfolio-7v27jfiiq-razikmakmak-1648s-projects.vercel.app) **GitSearch** · [gitsearch-website.vercel.app](https://gitsearch-website.vercel.app) **KIZ Player** · [kiz-player.vercel.app](https://kiz-player.vercel.app) **Email** · [razikmakmak@gmail.com](mailto:razikmakmak@gmail.com)

*Building things that work. From Algiers.*

**No servers · No tracking · No BS**
