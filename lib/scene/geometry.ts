/**
 * Desk-plane math for the 2D scene.
 *
 * Every scene coordinate lives in a 1000×1000 space (each desk photo is a
 * square canvas scaled to 1000). The desk photos are shot from far enough away
 * that the tabletop is a parallelogram on screen, so an affine plane is enough
 * — no homography, and SVG `matrix()` can express it directly.
 *
 * Desk-local coordinates: u runs 0→1 left→right, v runs 0→1 back→front.
 */

export type Vec = readonly [number, number];

export interface Plane {
  /** Back-left corner of the tabletop. */
  origin: Vec;
  /** Back-left → back-right (the full desk width). */
  u: Vec;
  /** Back-left → front-left (the full desk depth). */
  v: Vec;
}

export function planeFromCorners(backLeft: Vec, backRight: Vec, frontLeft: Vec): Plane {
  return {
    origin: backLeft,
    u: [backRight[0] - backLeft[0], backRight[1] - backLeft[1]],
    v: [frontLeft[0] - backLeft[0], frontLeft[1] - backLeft[1]],
  };
}

export function project(plane: Plane, u: number, v: number): Vec {
  return [
    plane.origin[0] + u * plane.u[0] + v * plane.v[0],
    plane.origin[1] + u * plane.u[1] + v * plane.v[1],
  ];
}

/**
 * The photos are shot from a very low angle, so a geometrically exact
 * keyboard would be a few pixels tall. Flat items get their on-screen depth
 * stretched vertically by this factor, around their own center, so they stay
 * readable while still sitting on the desk.
 */
export const FLAT_LIFT = 3.2;

/** Physical tabletop size every desk spec is calibrated against. */
export const DESK_CM = { width: 140, depth: 70 } as const;

export interface FlatPlacement {
  /** Desk-local center of the item. */
  at: Vec;
  /** Physical footprint (width along u, depth along v). */
  sizeCm: Vec;
  /** Opaque bounding box of the top-view art, as fractions of the image. */
  crop: readonly [x0: number, y0: number, x1: number, y1: number];
}

/**
 * SVG `matrix(a b c d e f)` that maps a unit-square image (0..1 in both axes)
 * so its cropped artwork lies flat on the desk at `at` with the given footprint.
 */
export function flatMatrix(plane: Plane, { at, sizeCm, crop }: FlatPlacement): string {
  const [x0, y0, x1, y1] = crop;
  const perS = sizeCm[0] / DESK_CM.width / (x1 - x0);
  const perT = sizeCm[1] / DESK_CM.depth / (y1 - y0);
  const vLift: Vec = [plane.v[0], plane.v[1] * FLAT_LIFT];
  const center = project(plane, at[0], at[1]);
  const sc = (x0 + x1) / 2;
  const tc = (y0 + y1) / 2;

  const a = perS * plane.u[0];
  const b = perS * plane.u[1];
  const c = perT * vLift[0];
  const d = perT * vLift[1];
  const e = center[0] - sc * a - tc * c;
  const f = center[1] - sc * b - tc * d;
  return `matrix(${[a, b, c, d, e, f].map((n) => +n.toFixed(4)).join(" ")})`;
}
