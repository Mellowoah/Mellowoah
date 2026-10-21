# Yo (fixed build)

A self-contained static app: `index.html` (all JS and CSS inline), plus `assets/` (toon.png, a cleaned-up arm.png, icons), `favicon.svg` and `manifest.webmanifest`. There is no build step and nothing to install. The only network request is Google Fonts, and it falls back to system fonts if that fails.

Run it locally with `python3 -m http.server` in this folder, then open http://localhost:8000.
Tilt controls need HTTPS on phones (iOS only grants motion permission on secure origins).

Debug hook: `window.__yo.state()`.

Arm rig: arm.png is split at the wrist into forearm and hand pieces at load time. A shoulder pivot plus wrist bend, driven by damped springs, adds wind-up and flick on throws, a tug on bind, a dip on catch, idle breathing, tension lean, and trick reactions.
Test hooks: `__yo.manual(true)` and `__yo.advance(frames)` step the game frame by frame (used to record anim/throw-and-return.mp4).
