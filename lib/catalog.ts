import { planeFromCorners, type Plane, type Vec } from "./scene/geometry";

/**
 * Product catalog plus the per-asset calibration the scene needs.
 * Prices are placeholders (IDR per month).
 */

export type Category = "desk" | "chair" | "monitor" | "keyboard" | "mouse" | "extra";

interface BaseProduct {
  id: string;
  name: string;
  brand: string;
  tagline: string;
  pricePerMonth: number;
  /** Image used on product cards and in the summary. */
  thumb: string;
}

/** Art for an item that stands upright; drawn unwarped, anchored at its base. */
export interface UprightArt {
  src: string;
  /** Point that touches the desk/floor, as fractions of the image. */
  anchor: Vec;
  /** Rendered height of the image, in scene units. */
  size: number;
  /** Width / height of the source image. @default 1 */
  aspect?: number;
}

/** Top-view art that gets laid flat on the desk plane. */
export interface FlatArt {
  src: string;
  crop: readonly [number, number, number, number];
  sizeCm: Vec;
}

export interface Desk extends BaseProduct {
  category: "desk";
  src: string;
  plane: Plane;
  /** Scene point where the chair's base sits. */
  chairSpot: Vec;
}

export interface Chair extends BaseProduct {
  category: "chair";
  art: UprightArt;
}

export interface Monitor extends BaseProduct {
  category: "monitor";
  /** Used when it's the only monitor. */
  front: UprightArt;
  /** Used in a dual setup; the left one is mirrored so both angle inward. */
  side: UprightArt;
}

export interface Keyboard extends BaseProduct {
  category: "keyboard";
  art: FlatArt;
}

export interface Mouse extends BaseProduct {
  category: "mouse";
  art: FlatArt;
}

/** Free-standing desk extras; each one has its own spot and can be toggled on independently. */
export interface Extra extends BaseProduct {
  category: "extra";
  art: UprightArt;
  /** Desk-local spot (u, v). */
  at: Vec;
}

export type Product = Desk | Chair | Monitor | Keyboard | Mouse | Extra;

// Corner measurements were taken on the source PNGs and scaled into the
// 1000-unit scene space (wood: 900px canvas, white: 920px canvas).
const px = (size: number) => (x: number, y: number): Vec => [(x * 1000) / size, (y * 1000) / size];
const wood = px(900);
const white = px(920);

export const desks: Desk[] = [
  {
    id: "walnut",
    category: "desk",
    name: "Walnut Standing Desk",
    brand: "monis",
    tagline: "Electric sit-stand, 140×70 cm, 3 memory presets",
    pricePerMonth: 650_000,
    thumb: "/assets/desk-wood.png",
    src: "/assets/desk-wood.png",
    plane: planeFromCorners(wood(292, 263), wood(815, 292), wood(112, 287)),
    chairSpot: [250, 905],
  },
  {
    id: "arctic",
    category: "desk",
    name: "Arctic Standing Desk",
    brand: "monis",
    tagline: "Clean white top, 140×70 cm, quiet dual motor",
    pricePerMonth: 550_000,
    thumb: "/assets/desk-white.png",
    src: "/assets/desk-white.png",
    plane: planeFromCorners(white(262, 273), white(835, 297), white(90, 298)),
    chairSpot: [235, 905],
  },
];

export const chairs: Chair[] = [
  {
    id: "polo",
    category: "chair",
    name: "Polo Ergonomic",
    brand: "monis",
    tagline: "Mesh back, adjustable headrest & 3D armrests",
    pricePerMonth: 450_000,
    thumb: "/assets/chair-polo-front.png",
    art: { src: "/assets/chair-polo-back.png", anchor: [0.48, 0.93], size: 640 },
  },
  {
    id: "aqua",
    category: "chair",
    name: "Aqua Task Chair",
    brand: "monis",
    tagline: "Compact, firm lumbar support, armless",
    pricePerMonth: 300_000,
    thumb: "/assets/chair-aqua-front.png",
    art: { src: "/assets/chair-aqua-back.png", anchor: [0.5, 0.972], size: 500 },
  },
];

export const monitors: Monitor[] = [
  {
    id: "flat27",
    category: "monitor",
    name: 'Xiaomi 27" 2K',
    brand: "Xiaomi",
    tagline: "IPS, 2560×1440, height-adjustable stand",
    pricePerMonth: 350_000,
    thumb: "/assets/monitor-xiaomi-flat-front.png",
    front: { src: "/assets/monitor-xiaomi-flat-front.png", anchor: [0.5, 0.771], size: 400 },
    side: { src: "/assets/monitor-xiaomi-flat-side.png", anchor: [0.48, 0.796], size: 364 },
  },
  {
    id: "curved34",
    category: "monitor",
    name: 'Xiaomi 34" Curved',
    brand: "Xiaomi",
    tagline: "Ultrawide 3440×1440, 180 Hz, 1500R curve",
    pricePerMonth: 550_000,
    thumb: "/assets/monitor-xiaomi-curved-front.png",
    front: { src: "/assets/monitor-xiaomi-curved-front.png", anchor: [0.5, 0.775], size: 388 },
    side: { src: "/assets/monitor-xiaomi-curved-side.png", anchor: [0.507, 0.772], size: 352 },
  },
];

export const keyboards: Keyboard[] = [
  {
    id: "mx-keys",
    category: "keyboard",
    name: "Logitech MX Keys",
    brand: "Logitech",
    tagline: "Backlit, multi-device, full size",
    pricePerMonth: 150_000,
    thumb: "/assets/keyboard-logi-top.png",
    art: { src: "/assets/keyboard-logi-top.png", crop: [0.125, 0.385, 0.873, 0.615], sizeCm: [43, 13] },
  },
  {
    id: "magic-keyboard",
    category: "keyboard",
    name: "Apple Magic Keyboard",
    brand: "Apple",
    tagline: "Touch ID, numeric keypad, slim profile",
    pricePerMonth: 175_000,
    thumb: "/assets/keyboard-apple-top.png",
    art: { src: "/assets/keyboard-apple-top.png", crop: [0.124, 0.404, 0.874, 0.61], sizeCm: [42, 11.5] },
  },
];

export const mice: Mouse[] = [
  {
    id: "mx-master",
    category: "mouse",
    name: "Logitech MX Master 3S",
    brand: "Logitech",
    tagline: "Ergonomic, quiet clicks, MagSpeed wheel",
    pricePerMonth: 100_000,
    thumb: "/assets/mouse-logi-top.png",
    art: { src: "/assets/mouse-logi-top.png", crop: [0.324, 0.229, 0.652, 0.715], sizeCm: [8.4, 12.5] },
  },
  {
    id: "magic-mouse",
    category: "mouse",
    name: "Apple Magic Mouse",
    brand: "Apple",
    tagline: "Multi-touch surface, ultra slim",
    pricePerMonth: 90_000,
    thumb: "/assets/mouse-apple-top.png",
    art: { src: "/assets/mouse-apple-top.png", crop: [0.335, 0.192, 0.64, 0.799], sizeCm: [5.7, 11.4] },
  },
];

export const extras: Extra[] = [
  {
    id: "snake-plant",
    category: "extra",
    name: "Snake Plant",
    brand: "monis green",
    tagline: "Low-light hardy, ceramic pot, watered on every visit",
    pricePerMonth: 75_000,
    thumb: "/assets/plant-front.png",
    art: { src: "/assets/plant-front.png", anchor: [0.496, 0.88], size: 190, aspect: 383 / 460 },
    at: [0.93, 0.2],
  },
  {
    id: "switch2",
    category: "extra",
    name: "Nintendo Switch 2",
    brand: "Nintendo",
    tagline: "Dock, Joy-Con 2 and HDMI, for after-hours",
    pricePerMonth: 400_000,
    thumb: "/assets/nintendo-switch-front.png",
    art: { src: "/assets/nintendo-switch-front.png", anchor: [0.5, 0.687], size: 147 },
    at: [0.1, 0.45],
  },
];

export const catalog = {
  desk: desks,
  chair: chairs,
  monitor: monitors,
  keyboard: keyboards,
  mouse: mice,
  extra: extras,
} satisfies { [C in Category]: Extract<Product, { category: C }>[] };

const byId = new Map<string, Product>(
  Object.values(catalog).flat().map((p) => [`${p.category}:${p.id}`, p])
);

export function findProduct<C extends Category>(category: C, id: string | undefined) {
  if (!id) return undefined;
  return byId.get(`${category}:${id}`) as Extract<Product, { category: C }> | undefined;
}

export const MAX_MONITORS = 2;

export const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
