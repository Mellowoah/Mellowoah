# Yo (fixed build, v3)

A self-contained static app: `index.html` (all JS and CSS inline), plus `assets/` (toon.png for the logo, icons, and the legacy arm.png, which is no longer drawn), `favicon.svg` and `manifest.webmanifest`. There is no build step and nothing to install. The only network request is Google Fonts (Lilita One, Fraunces, Outfit), with system fonts as the fallback.

Run it locally with `python3 -m http.server` in this folder, then open http://localhost:8000.
On phones, tilt controls and code redeeming need HTTPS (or localhost): iOS only grants motion permission on secure origins, and `crypto.subtle` only exists there.

## What's in v3
- **First-person camera: the phone is your yo-yo hand.** You look down at the phone and your own fist sits at the bottom of the screen, with the forearm coming up from the bottom-right edge (drawn wider toward the edge for perspective). Swipe UP (away from you), tap, or flick the phone forward to throw: the yo-yo flies away toward the floor, which on screen means up and shrinking toward a vanishing point at the upper-middle. Pull DOWN, tap, or pull the phone back to bind, and it grows as it comes back to your fingers. Depth cues: a perspective floor, a landing ring, a contact shadow that darkens and sharpens near the floor, distance fog and a soft halo. Around the World loops back past (in front of) your fist. The rig keeps the wind-up (fist draws back), the forward flick, the bind yank, the catch slap, idle sway and the tension lean. The physics is unchanged; only the camera projection is new.
- **Procedural fist.** The hand is painted in code (per theme) as a clean palm-down fist seen from behind/above: 4 knuckles, curled fingertips, a solid thumb wrapping in from the left, and the string leaving between the thumb and index finger. The old side-view arm.png left a dark hole in the middle of the fist from this angle, so it isn't used any more.
- **Dynamic camera.** The view follows the yo-yo out on a throw, pushing in with a little lead (your fist slides partly off the bottom). It frames the yo-yo, the floor and your hand while it sleeps, holds a moderate shot for swings, and eases out to a wide shot for Walk the Dog. On a bind it zooms back in and follows the yo-yo home, settling on your hand at the catch. All the moves are damped springs, the HUD never moves, big tricks add a little shake, and reduced motion tones it right down. On desktop the hand stays under the mouse cursor while the camera moves. `__yo.cam` exposes the camera mode and zoom.
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
