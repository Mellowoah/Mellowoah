# Yo (fixed build, v3)

A self-contained static app: `index.html` (all JS and CSS inline), plus `assets/` (toon.png for the logo, icons, and the legacy arm.png, which is no longer drawn), `favicon.svg` and `manifest.webmanifest`. There is no build step and nothing to install. The only network request is Google Fonts (Lilita One, Fraunces, Outfit), with system fonts as the fallback.

Run it locally with `python3 -m http.server` in this folder, then open http://localhost:8000.
On phones, tilt controls and code redeeming need HTTPS (or localhost): iOS only grants motion permission on secure origins, and `crypto.subtle` only exists there.

## What's in v3
- **Top-down view: the phone is held flat above your hand.** You look straight down at the floor. Your own fist is at the bottom of the screen, fingers pointing up, with the forearm coming in from the bottom edge, as if the screen were a window right above your hand. Swipe UP, tap, or flick the phone forward to throw: the yo-yo drops straight down away from you, shrinking as it falls and staying near your hand, with the string seen almost end-on. Pull DOWN, tap, or pull the phone back to bind. The yo-yo is drawn face-on (its face/rim art, spinning) with a shadow on the floor below. The floor is the background, seen from above: wooden stage planks, a neon grid, or mown grass, each with a landing circle under your hand.
- **Procedural fist.** The hand is painted in code (per theme) as a clean palm-down fist seen from behind/above: 4 knuckles, curled fingertips, a solid thumb wrapping in from the left, and the string leaving between the thumb and index finger. The old side-view arm.png left a dark hole in the middle of the fist from this angle, so it isn't used any more.
- **Dynamic camera.** On a throw the lens zooms down after the yo-yo so it stays about the same size on screen. The floor grows as you close in, and your fingertips slide to the bottom edge. Walk the Dog zooms out to show your hand and the yo-yo rolling on the floor together, holds for a beat, then zooms back in and follows the yo-yo up to your hand. Swings get a moderate framing. All the moves are damped springs, the HUD never moves, and reduced motion tones it right down. `__yo.cam` exposes the camera mode and zoom.
- **Themes** (Settings > Theme): Gold Arena (default: bleachers with crowd lights, lighting truss, sweeping spotlights, perspective stage floor, vignette), Neon Night (synthwave sun, skyline, scrolling grid) and Sunset Park (sky, sun, hills, trees, grass). Each one restyles the HUD frames, buttons and accent colour too.
- **Game HUD.** Lilita One display font, a level badge with an XP bar, a coin counter, a combo chip that catches fire at ×2 and above, punch-zoom and screen shake on big tricks, and flame particles from combo ×3.
- **8 distinct yo-yos**, drawn procedurally in both the picker (3/4 view) and in play (face-on): Pocket, Maple, Brass, Hound, Orbit and Night, plus two SPECIAL ones. Whatever you pick is what you play with.
  - **Flower:** petal caps, pastel shell, petal trail. Unlock it by landing Rock the Baby 3 times.
  - **Diamond:** faceted crystal, glints, sparkle trail. Code only.
- **Redeem code** field in Settings and on the locked Diamond card. Input is normalised (all whitespace removed, upper-cased), hashed with SHA-256 via `crypto.subtle`, and compared to `1b53348b10abe5c76d83800e6779462bfa4ef26f5dc467e4972ae405dfc9b23a`. Only the hash is in this build. A match unlocks Diamond permanently (localStorage `yo-app-v3` -> `codes.diamond`) with a celebration; a miss shakes the field and shows an error. Resetting progress keeps redeemed codes.

## Debug / test hooks
- `window.__yo.state()` returns phase, model, theme, level/xp/coins, unlocked list, etc.
- `__yo.manual(true)` plus `__yo.advance(frames)` step the game frame by frame (used to record anim/throw-and-return.mp4).
- `__yo.drive(x, y)` and `__yo.release()` move the hand.
- `__yo.lineup()` renders every model's art into a PNG data URL. It is a preview only and unlocks nothing.
