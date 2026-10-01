"use client";

import Image from "next/image";
import { Check, Minus, Plus } from "lucide-react";
import { Badge } from "@/components/jl/badge";
import { catalog, formatIDR, MAX_MONITORS, type Category, type Product } from "@/lib/catalog";
import { countInSetup, type Setup, type SetupAction } from "@/lib/setup";
import { toast } from "@/components/jl/toast";

const HINTS: Record<Category, string> = {
  desk: "Every desk is electric sit-stand, 140×70 cm.",
  chair: "Pick the chair you'll spend 8 hours in.",
  monitor: `Up to ${MAX_MONITORS} on the desk. Two monitors angle in toward you.`,
  keyboard: "Tap again to take it off the desk.",
  mouse: "Tap again to take it off the desk.",
  extra: "Add as many as you like. Tap again to remove.",
};

interface ProductPickerProps {
  category: Category;
  setup: Setup;
  dispatch: (action: SetupAction) => void;
}

export function ProductPicker({ category, setup, dispatch }: ProductPickerProps) {
  const products: Product[] = catalog[category];

  function activate(product: Product) {
    switch (product.category) {
      case "desk":
      case "chair":
        dispatch({ type: "select", category: product.category, id: product.id });
        break;
      case "keyboard":
      case "mouse":
        dispatch({ type: "toggle", category: product.category, id: product.id });
        break;
      case "extra":
        dispatch({ type: "toggleExtra", id: product.id });
        break;
      case "monitor":
        if (setup.monitors.length >= MAX_MONITORS) {
          toast.warning(`The desk fits ${MAX_MONITORS} monitors. Remove one to swap it.`);
          return;
        }
        dispatch({ type: "addMonitor", id: product.id });
    }
  }

  function removeMonitor(id: string) {
    dispatch({ type: "removeMonitor", index: setup.monitors.lastIndexOf(id) });
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-fg-muted">{HINTS[category]}</p>
      <ul className="grid grid-cols-2 gap-3">
        {products.map((product) => {
          const count = countInSetup(setup, category, product.id);
          const selected = count > 0;
          return (
            <li key={product.id}>
              <ProductCard
                product={product}
                selected={selected}
                onActivate={() => activate(product)}
                footer={
                  product.category === "monitor" ? (
                    <MonitorStepper
                      count={count}
                      canAdd={setup.monitors.length < MAX_MONITORS}
                      onAdd={() => activate(product)}
                      onRemove={() => removeMonitor(product.id)}
                    />
                  ) : null
                }
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ProductCard({
  product,
  selected,
  onActivate,
  footer,
}: {
  product: Product;
  selected: boolean;
  onActivate: () => void;
  footer: React.ReactNode;
}) {
  return (
    <div
      className={[
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-all",
        selected
          ? "border-accent shadow-[0_0_0_1px_var(--accent)]"
          : "border-line-subtle hover:-translate-y-0.5 hover:border-line hover:shadow-md",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onActivate}
        aria-pressed={selected}
        className="flex flex-1 cursor-pointer flex-col text-left focus-visible:outline-none"
      >
        <div className="relative aspect-[4/3] w-full bg-sunken">
          <Image
            src={product.thumb}
            alt=""
            fill
            sizes="(max-width: 1024px) 45vw, 200px"
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          />
          {selected && (
            <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-accent text-white shadow">
              <Check size={14} strokeWidth={3} aria-hidden />
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3">
          <span className="text-xs text-fg-subtle">{product.brand}</span>
          <span className="font-semibold leading-tight text-fg">{product.name}</span>
          <span className="line-clamp-2 text-xs text-fg-muted">{product.tagline}</span>
          <span className="mt-auto pt-2">
            <Badge color={selected ? "brand" : "neutral"}>{formatIDR(product.pricePerMonth)}/mo</Badge>
          </span>
        </div>
      </button>
      {footer}
    </div>
  );
}

function MonitorStepper({
  count,
  canAdd,
  onAdd,
  onRemove,
}: {
  count: number;
  canAdd: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-t border-line-subtle px-2 py-1.5">
      <button
        type="button"
        onClick={onRemove}
        disabled={count === 0}
        aria-label="Remove one"
        className="grid size-8 cursor-pointer place-items-center rounded-lg text-fg-muted hover:bg-sunken disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Minus size={16} />
      </button>
      <span className="text-sm font-semibold tabular-nums" aria-live="polite">
        {count} on desk
      </span>
      <button
        type="button"
        onClick={onAdd}
        disabled={!canAdd}
        aria-label="Add one"
        className="grid size-8 cursor-pointer place-items-center rounded-lg text-fg-muted hover:bg-sunken disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
