# DJ Olatuns Android Release Roadmap

Repository: djolatuns/djolatuns.github.io
Android package: com.djolatuns.app

## Current verified baseline
- Android CI currently builds a Debug APK.
- The workflow verifies package metadata and APK signature, but that signature is the debug signing identity.
- APK is published at downloads/DJ-Olatuns.apk for direct installation.
- download.html links to that APK.
- Mixtape cards currently link out to Audiomack; there is no native in-app streaming player in the inspected UI.
- Current announcement flow uses the site_notifications table for in-app announcement display; native push delivery is not yet verified.
- No GitHub Release was found at the time of this audit.

## Release milestones
1. **Permanent release signing**: generate and securely store a keystore outside the repository. Add GitHub Actions secrets (keystore base64, keystore password, key alias, key password). Never commit the keystore or passwords.
2. **Signed release APK/AAB**: build with the permanent signing key; verify package ID, signature, version metadata, and artifact.
3. **Update delivery**: keep package ID and signing key stable; publish versioned release artifacts and a release notes/changelog. Direct APK updates require users to download and install the update; in-app automatic update behavior must be designed separately.
4. **Push notifications**: implement and test a native push delivery provider, permission onboarding, token lifecycle, and user opt-out. Existing site announcements alone do not constitute native push.
5. **Music playback**: replace outbound-only Audiomack listening links with an in-app streaming player backed by approved hosted audio/storage, with playback state, seek, stream access controls, play counts, and background playback validation.

## Google Play preparation
- Produce a signed Android App Bundle (AAB) for store upload.
- Confirm privacy policy URL and contact details.
- Complete Play Console Data Safety and content declarations.
- Prepare app icon, phone screenshots, listing copy, and support contact.
- Test login/signup, account deletion policy and process, media playback, permissions, deep links, and crash behavior.
- Confirm current Google Play policy requirements and target API requirements at submission time.

## Security notes
- Never commit signing keys, service-role credentials, or secret tokens.
- Keep Supabase publishable client keys in the frontend only; enforce sensitive access with database policies and server-side controls.
- Restrict mixtape upload and administrative features to verified administrators.
