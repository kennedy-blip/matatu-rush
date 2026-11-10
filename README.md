# Matatu Rush: Apex Escape

A responsive browser-based 3D endless runner built with React, TypeScript, Three.js, React Three Fiber, Tailwind CSS, and Lucide icons.

## Run locally

Requirements: Node.js 20+ and pnpm.

```bash
pnpm install --no-frozen-lockfile
pnpm dev
```

Open the local Vite URL printed in the terminal. For a production build:

```bash
pnpm check
pnpm build
```

## Controls

- **A / D** or **Left / Right**: change lanes
- **W / Space / Up**: jump open drainage trenches
- **S / Down**: slide under laundry lines
- **P / Escape**: pause or resume
- **Touch**: swipe left/right to switch lanes, swipe up to jump, swipe down to slide; on-screen buttons are also available on mobile

## Included

- Procedural Three.js street scene with shacks, overhead wires, neon signs, puddles, dust, obstacles, and the pursuing matatu
- Endless-run scoring, distance, speed, shilling collection, chase proximity, and three-hit run health
- Outfit selection and purchasable jump/slide upgrades
- Synthesized low engine ambience, soundscape controls, and a haptic-feedback simulation switch
- Best distance, wallet, unlocked outfits, and purchased upgrades saved in browser local storage

This is a client-side demo; it does not require a backend or external game assets. Google Fonts are loaded when online, with system font fallbacks.
