DJ OLATUNS PWA WEBSITE FILES

Files included:
- index.html: premium mobile-app-style website
- manifest.webmanifest: Android install metadata
- service-worker.js: caches the app shell for repeat/offline opening
- og-image.webp: provided DJ OLATUNS logo
- icons/icon-192.png and icons/icon-512.png: app icons

DEPLOY TO THE EXISTING GITHUB PAGES REPOSITORY
1. Open https://github.com/djolatuns/djolatuns.github.io
2. Upload/replace index.html in the repository root.
3. Upload manifest.webmanifest and service-worker.js to the repository root.
4. Upload og-image.webp to the repository root (replace the old one if prompted).
5. Upload the icons folder including both PNG files, preserving the folder path.
6. Commit the changes to the main branch.
7. Wait for GitHub Pages to publish, then visit https://djolatuns.github.io/ and refresh.

ANDROID INSTALL
1. Open https://djolatuns.github.io/ in Chrome on Android.
2. Open Chrome's three-dot menu.
3. Choose "Install app" or "Add to Home screen" (wording can vary).
4. Confirm. The installed shortcut opens in standalone app-style mode.

NOTES
- This is a Progressive Web App (PWA), not a Play Store APK.
- Audiomack, WhatsApp, TikTok and Facebook links require internet.
- Service-worker caching is a basic app shell cache, not offline music playback.
