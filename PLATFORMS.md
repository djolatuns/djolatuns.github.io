# DJ Olatuns multi-platform release plan

The web app and Supabase remain the shared product/backend. Native shells are being prepared around the existing web app; this scaffolding does not yet mean signed or store-ready installers have been produced.

## Target platforms
- Android: Capacitor (APK/AAB; Play Store or direct installation)
- iOS/iPadOS: Capacitor (requires macOS + Xcode; App Store distribution)
- Windows: Tauri 2 (Windows installer)
- macOS: Tauri 2 (DMG/app bundle; signing/notarization required for public distribution)

## Shared app ID
- `com.djolatuns.app`

## Build prerequisites
- Node.js LTS and npm
- Android Studio + Android SDK for Android builds
- macOS + Xcode for iOS builds
- Rust toolchain + Tauri prerequisites for desktop builds
- Apple Developer account for App Store/TestFlight distribution and signing
- Signing certificates for Windows/macOS public releases

## Current scope
The native wrappers load the existing DJ Olatuns static app into a local web bundle. Supabase Auth, data, and cloud content remain shared. Before release, verify mobile audio playback, auth redirect behavior, external links, notification permissions, offline behavior, safe-area layout, upload restrictions, and media download controls on each platform.
