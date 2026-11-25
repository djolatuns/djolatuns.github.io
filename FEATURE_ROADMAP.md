# DJ Olatuns App — Feature Upgrade Roadmap

This roadmap tracks the approved upgrade set for the existing GitHub Pages + Supabase app. AppDeploy is not used.

## Delivered in the current foundation release

- [x] Unified in-app player for uploaded cloud mixtapes, with a persistent mini-player.
- [x] Save uploaded mixtapes to a member's personal library.
- [x] Create playlists and add/remove saved mixtapes.
- [x] Public member profile views from community posts and connection lists.
- [x] Profile privacy setting enforced by database row-level security.
- [x] Private member messaging using existing conversation tables and an access-checked conversation RPC.
- [x] Messaging permissions: everyone, members the profile owner follows, or nobody.
- [x] In-app notifications for follows, post likes, comments and private messages.
- [x] Search members, published posts and published mixtapes.
- [x] Member privacy/settings screen and account-deletion request workflow.
- [x] Help/support request submission and member request history.
- [x] Admin support-request review and status updates.
- [x] Basic creator analytics for community activity, mixtape plays, bookings and verified transactions.
- [x] Read-only transaction-history screen and secure transaction-record table.
- [x] AI conversation-history screen using the existing private AI conversation tables.
- [x] App update checker for the PWA service worker.
- [x] Offline app-shell fallback and improved image/list loading for mobile performance.

## Remaining integrations / next development work

- [ ] Connect a private AI provider through a Supabase Edge Function and server-side secret. Do not put an AI API key in browser code.
- [ ] Connect a payment provider and verified server-side webhook before recording successful payments or showing checkout.
- [x] Add browser push subscription management and service-worker notification handling for supported devices.\n- [x] Deliver push alerts for new bookings to CEO devices, private messages to conversation recipients, and community posts only after admin approval.\n- [ ] Expand push delivery to the remaining in-app notification types (likes, comments and follows).
- [ ] Expand the music player with queue controls, repeat/shuffle and playlist playback.
- [ ] Add full member administration tools, including safe account moderation and reporting workflows.
- [ ] Expand offline support to explicitly saved media where licensing and storage rules permit.
- [ ] Complete device testing for Android, iOS, Windows and macOS.

## Release checks

- Validate JavaScript syntax and HTML IDs/navigation with GitHub Actions.
- Confirm the service-worker cache and asset query versions match.
- Test with at least two ordinary member accounts and the administrator account.
- Verify privacy, messaging, notification and support-request row-level security.
- Do not treat a successful repository validation as proof that every live feature has been manually tested on a phone.
