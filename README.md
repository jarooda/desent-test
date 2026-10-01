# monis.rent — Workspace Builder

An interactive tool for digital nomads in Bali to design a workspace, see it come together, and rent it by the month.

Pick a desk and a chair, then add monitors, a keyboard, a mouse and extras (a plant, a Nintendo Switch 2). Each item drops onto the desk in the preview. Click anything in the scene to jump to its options, then use **Review & rent** to see the summary and choose a rental period.

## Approach

**2D that looks like 3D.** A Three.js scene would mean shipping a WebGL runtime and 3D models, which is heavy on the mobile connections nomads often use. The preview is a single SVG built from product photos instead:

- Each desk photo is calibrated once: three tabletop corners define an affine *desk plane* (`lib/scene/geometry.ts`). The photos are shot from far away, so the tabletop is a parallelogram and no homography is needed.
- Items are placed in desk coordinates (`u` left→right, `v` back→front) and projected into the scene.
- **Flat items** (keyboard, mouse) use top-view photos warped onto the desk plane with an SVG `matrix()`. The photos are taken from a low angle, so the true projection would be only a few pixels tall. On-screen depth is stretched (`FLAT_LIFT`) around each item's center so it stays readable while still lying on the desk.
- **Upright items** (monitors, chair) aren't warped; they're anchored at their base point. One monitor uses the front photo. Two monitors switch to the angled photos, with the left one mirrored so both face the user.
- The SVG `viewBox` makes the scene responsive with no resize handling, and scene images still go through the Next image optimizer (`getImageProps`).

**The setup lives in the URL** (`?desk=walnut&chair=polo&monitors=flat27,curved34…`). A reload keeps your work, and **Share** copies a link you can send to a co-founder. The page parses it on the server, so there's no flash of the default setup.

## Tech

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4 for layout
- [JLDS](https://jlds.jaluwibowo.id) components (Button, Tabs, Badge, Drawer, SegmentedControl, Stat, Toast), vendored in `components/jl` with the jlds CLI. Its CSS-variable tokens are exposed to Tailwind in `app/globals.css`.
- lucide-react icons
- Deployed on Vercel

## Project map

```
app/page.tsx                         server entry: parses the setup from search params
components/configurator/
  configurator.tsx                   layout, state, URL sync, share
  scene.tsx                          SVG workspace preview
  product-picker.tsx                 category product cards
  checkout-drawer.tsx                summary, rental period, rent
lib/catalog.ts                       products, placeholder prices, per-asset calibration
lib/setup.ts                         setup model, reducer, URL (de)serialization
lib/scene/geometry.ts                desk-plane projection math
```

## With more time

- More extras (lamps, desk mats, speakers). An extra is just a front-view photo plus a spot on the desk, so each new one is a few lines in `lib/catalog.ts`.
- Drag items along the desk. Positions are already in desk coordinates, so dragging would stay on the tabletop.
- Bundles and presets ("Developer dual-screen", "Minimal laptop setup") as one-tap starting points.
- A real checkout: delivery date and address in Bali, availability per item, payment.
- Consistent product photography from one camera angle, so every item matches the desk perspective exactly.
- Tests for the geometry and URL parsing, plus a visual regression snapshot of the scene.

## Development

```bash
pnpm install
pnpm dev
```
