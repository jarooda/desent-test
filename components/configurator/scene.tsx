"use client";

import { getImageProps } from "next/image";
import { preload } from "react-dom";
import { findProduct, type Category, type UprightArt } from "@/lib/catalog";
import { flatMatrix, project, type Plane, type Vec } from "@/lib/scene/geometry";
import type { Setup } from "@/lib/setup";

/** Desk-local spots items snap to when added. */
const SLOTS = {
  monitorSingle: [0.45, 0.3],
  monitorDual: [
    [0.27, 0.3],
    [0.68, 0.3],
  ],
  keyboard: [0.44, 0.7],
  mouse: [0.76, 0.7],
} satisfies Record<string, Vec | Vec[]>;

/** Visible window of the 1000×1000 scene space. */
const VIEWBOX = "40 40 920 900";

/** Route scene art through the Next image optimizer, sized for a 2x display. */
function optimized(src: string, size: number) {
  const w = Math.round(size);
  return getImageProps({ src, alt: "", width: w, height: w }).props.src;
}

interface SceneProps {
  setup: Setup;
  onPick?: (category: Category) => void;
}

export function Scene({ setup, onPick }: SceneProps) {
  const desk = findProduct("desk", setup.desk)!;
  const chair = findProduct("chair", setup.chair)!;
  const monitors = setup.monitors.map((id) => findProduct("monitor", id)!);
  const keyboard = findProduct("keyboard", setup.keyboard);
  const mouse = findProduct("mouse", setup.mouse);
  const extras = setup.extras.map((id) => findProduct("extra", id)!);
  const { plane } = desk;
  const deskSrc = optimized(desk.src, 1000);
  // The desk is the LCP element; SVG <image> isn't discovered by the preload scanner.
  preload(deskSrc, { as: "image", fetchPriority: "high" });

  const label = [
    desk.name,
    chair.name,
    ...monitors.map((m) => m.name),
    keyboard?.name,
    mouse?.name,
    ...extras.map((e) => e.name),
  ]
    .filter(Boolean)
    .join(", ");

  // Everything standing on the desk, painted back-to-front by its v coordinate.
  const onDesk: { v: number; node: React.ReactNode }[] = [];
  monitors.forEach((m, i) => {
    const dual = monitors.length > 1;
    const at = dual ? SLOTS.monitorDual[i] : SLOTS.monitorSingle;
    onDesk.push({
      v: at[1],
      node: (
        <SceneItem key={`monitor-${i}-${m.id}-${dual ? "side" : "front"}`} category="monitor" title={m.name} onPick={onPick}>
          <Upright art={dual ? m.side : m.front} at={project(plane, at[0], at[1])} mirror={dual && i === 0} />
        </SceneItem>
      ),
    });
  });
  for (const e of extras) {
    onDesk.push({
      v: e.at[1],
      node: (
        <SceneItem key={`extra-${e.id}`} category="extra" title={e.name} onPick={onPick}>
          <Upright art={e.art} at={project(plane, e.at[0], e.at[1])} />
        </SceneItem>
      ),
    });
  }
  if (keyboard) {
    onDesk.push({
      v: SLOTS.keyboard[1],
      node: (
        <SceneItem key={`keyboard-${keyboard.id}`} category="keyboard" title={keyboard.name} onPick={onPick}>
          <Flat plane={plane} at={SLOTS.keyboard} art={keyboard.art} />
        </SceneItem>
      ),
    });
  }
  if (mouse) {
    onDesk.push({
      v: SLOTS.mouse[1],
      node: (
        <SceneItem key={`mouse-${mouse.id}`} category="mouse" title={mouse.name} onPick={onPick}>
          <Flat plane={plane} at={SLOTS.mouse} art={mouse.art} />
        </SceneItem>
      ),
    });
  }
  onDesk.sort((a, b) => a.v - b.v);

  return (
    <svg
      viewBox={VIEWBOX}
      className="block h-full w-full select-none"
      role="img"
      aria-label={`Workspace preview: ${label}`}
    >
      <defs>
        <filter id="contact" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.35" />
        </filter>
        <radialGradient id="floor-shadow">
          <stop offset="0%" stopColor="#000" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx={510} cy={760} rx={420} ry={60} fill="url(#floor-shadow)" />

      <SceneItem key={`desk-${desk.id}`} category="desk" title={desk.name} onPick={onPick}>
        <image href={deskSrc} x={0} y={0} width={1000} height={1000} />
      </SceneItem>

      {onDesk.map((item) => item.node)}

      <SceneItem key={`chair-${chair.id}`} category="chair" title={chair.name} onPick={onPick}>
        <ellipse
          cx={desk.chairSpot[0]}
          cy={desk.chairSpot[1] - 6}
          rx={chair.art.size * 0.3}
          ry={chair.art.size * 0.045}
          fill="url(#floor-shadow)"
        />
        <Upright art={chair.art} at={desk.chairSpot} />
      </SceneItem>
    </svg>
  );
}

function SceneItem({
  category,
  title,
  onPick,
  children,
}: {
  category: Category;
  title: string;
  onPick?: (category: Category) => void;
  children: React.ReactNode;
}) {
  return (
    <g className="scene-item" data-category={category} onClick={() => onPick?.(category)}>
      <title>{title}</title>
      {children}
    </g>
  );
}

function Upright({ art, at, mirror = false }: { art: UprightArt; at: Vec; mirror?: boolean }) {
  const width = art.size * (art.aspect ?? 1);
  const x = at[0] - art.anchor[0] * width;
  const y = at[1] - art.anchor[1] * art.size;
  return (
    <image
      href={optimized(art.src, Math.max(width, art.size))}
      x={x}
      y={y}
      width={width}
      height={art.size}
      transform={mirror ? `translate(${2 * at[0]} 0) scale(-1 1)` : undefined}
    />
  );
}

function Flat({
  plane,
  at,
  art,
}: {
  plane: Plane;
  at: Vec;
  art: { src: string; crop: readonly [number, number, number, number]; sizeCm: Vec };
}) {
  return (
    // The shadow filter sits outside the matrix so its blur is in scene units.
    <g filter="url(#contact)">
      <g transform={flatMatrix(plane, { at, sizeCm: art.sizeCm, crop: art.crop })}>
        <image href={optimized(art.src, 600)} x={0} y={0} width={1} height={1} preserveAspectRatio="none" />
      </g>
    </g>
  );
}
