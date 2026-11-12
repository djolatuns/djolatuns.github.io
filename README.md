# DJ Olatuns Digital Platforms

- Main app: https://djolatuns.github.io/
- OLATUNS WORLD: https://djolatuns.github.io/olatuns-world/

## Shared community service
The community feed uses a Cloudflare Worker API backed by a Cloudflare D1 database. Posts are shared between visitors; the API limits each network address to four posts per hour using a hashed address for rate limiting. Display names and post text are stored in the community database. The community is a public posting feed, not private messaging or authenticated user accounts.

## Configuration
Edit `site-config.js` to add the confirmed public Audiomack profile/release URL and public booking email or business WhatsApp number:
- `audiomackProfile`
- `newWaveMixtape`
- `bookingEmail`
- `bookingWhatsApp` (international digits only)

Do not place passwords, private keys, or other secrets in this file. It is downloaded by every visitor.

## Platform limitations
This is a static GitHub Pages app plus a separate Cloudflare API. The booking form opens an email or WhatsApp enquiry; it does not confirm bookings. The app does not yet provide private DMs, user accounts, or administrator moderation. OLATUNS WORLD contains launch content and sample editorial sections; replace them with verified updates before presenting them as current news.
