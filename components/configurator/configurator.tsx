"use client";

import { useEffect, useReducer, useRef, useState, useSyncExternalStore } from "react";
import { ArrowRight, MousePointerClick, RotateCcw, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/jl/button";
import { Tabs } from "@/components/jl/tabs";
import { toast, Toaster } from "@/components/jl/toast";
import { findProduct, formatIDR, MAX_MONITORS, type Category } from "@/lib/catalog";
import { serializeSetup, setupItems, setupReducer, type Setup } from "@/lib/setup";
import { CheckoutDrawer } from "./checkout-drawer";
import { ProductPicker } from "./product-picker";
import { Scene } from "./scene";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "desk", label: "Desk" },
  { value: "chair", label: "Chair" },
  { value: "monitor", label: "Monitors" },
  { value: "keyboard", label: "Keyboard" },
  { value: "mouse", label: "Mouse" },
  { value: "extra", label: "Extras" },
];

function useIsDesktop() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(min-width: 1024px)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => true
  );
}

export function Configurator({ initialSetup }: { initialSetup: Setup }) {
  const [setup, dispatch] = useReducer(setupReducer, initialSetup);
  const [tab, setTab] = useState<Category>("desk");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const isDesktop = useIsDesktop();

  // Keep the URL in sync so a reload or a shared link restores the setup.
  useEffect(() => {
    window.history.replaceState(null, "", `?${serializeSetup(setup)}`);
  }, [setup]);

  const items = setupItems(setup);
  const monthly = items.reduce((sum, p) => sum + p.pricePerMonth, 0);
  const hasAccessories =
    setup.monitors.length > 0 || setup.keyboard || setup.mouse || setup.extras.length > 0;

  function pick(category: Category) {
    setTab(category);
    if (!isDesktop) panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Send it to your co-founder or flatmate.", { title: "Setup link copied" });
    } catch {
      toast.warning("Couldn't copy automatically. Copy the URL from the address bar instead.");
    }
  }

  const tabItems = CATEGORIES.map((c) => ({
    ...c,
    count:
      c.value === "monitor" && setup.monitors.length
        ? setup.monitors.length
        : c.value === "extra" && setup.extras.length
          ? setup.extras.length
          : undefined,
  }));

  return (
    <div className="flex min-h-dvh flex-col bg-app">
      <header className="flex h-16 flex-none items-center justify-between gap-4 px-4 lg:px-8">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight text-fg">monis</span>
          <span className="hidden text-sm text-fg-muted sm:inline">Workspace Builder</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" icon={<Share2 size={16} />} onClick={share}>
            Share
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<RotateCcw size={16} />}
            onClick={() => {
              dispatch({ type: "reset" });
              setTab("desk");
            }}
          >
            <span className="hidden sm:inline">Start over</span>
          </Button>
        </div>
      </header>

      <main className="grid flex-1 grid-cols-[minmax(0,1fr)] content-start gap-4 px-4 pb-28 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-6 lg:px-8 lg:pb-8">
        <section
          aria-label="Workspace preview"
          className="relative min-w-0 overflow-hidden rounded-3xl border border-line-subtle bg-[radial-gradient(120%_90%_at_50%_0%,#ffffff_0%,var(--bg-subtle)_70%)] lg:sticky lg:top-4 lg:h-[calc(100dvh-6rem)] lg:self-start"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4 lg:p-6">
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-fg lg:text-2xl">Your Bali workspace</h1>
              <p className="text-sm text-fg-muted">Delivered and set up, rented by the month.</p>
            </div>
            <div className="rounded-full bg-card/90 px-3 py-1.5 text-sm font-semibold tabular-nums text-fg shadow-sm backdrop-blur">
              {formatIDR(monthly)}
              <span className="font-normal text-fg-muted">/mo</span>
            </div>
          </div>

          <div className="mx-auto aspect-square max-h-full w-full max-w-[min(100%,calc(100dvh-6rem))] pt-12 lg:pt-6">
            <Scene setup={setup} onPick={pick} />
          </div>

          <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center p-4">
            {hasAccessories ? (
              <span className="pointer-events-none flex items-center gap-2 rounded-full bg-card/90 px-3 py-1.5 text-xs text-fg-muted shadow-sm backdrop-blur">
                <MousePointerClick size={14} aria-hidden /> Tap anything on the desk to swap it
              </span>
            ) : (
              <button
                type="button"
                onClick={() => pick("monitor")}
                className="flex cursor-pointer items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white shadow-md transition-transform hover:scale-[1.03]"
              >
                <Sparkles size={16} aria-hidden /> Add a monitor to bring it to life
                <ArrowRight size={16} aria-hidden />
              </button>
            )}
          </div>
        </section>

        <aside
          ref={panelRef}
          aria-label="Choose products"
          className="flex min-w-0 scroll-mt-4 flex-col rounded-3xl border border-line-subtle bg-card lg:h-[calc(100dvh-6rem)] lg:sticky lg:top-4"
        >
          {/* Scroll on a wrapper, not the strip itself: overflow-x on the strip also makes
              overflow-y scrollable, and the tabs' -1px underline overlap triggers a vertical bar. */}
          <div className="overflow-x-auto overflow-y-hidden px-4 pt-2 [scrollbar-width:none] lg:px-5 [&::-webkit-scrollbar]:hidden">
            <Tabs
              items={tabItems}
              value={tab}
              onChange={(v) => setTab(v as Category)}
              className="w-max min-w-full"
              // Six categories: tighter than the default line-tab gap so they fit without scrolling.
              // overflow: the wrapper scrolls; jlds' own mobile overflow-x would re-add the vertical bar.
              style={{ gap: "var(--space-3)", overflow: "visible" }}
            />
          </div>
          <div className="flex-1 overflow-y-auto p-4 lg:p-5">
            <ProductPicker category={tab} setup={setup} dispatch={dispatch} />
          </div>
          <div className="hidden items-center justify-between gap-4 border-t border-line-subtle p-5 lg:flex">
            <SetupTotal setup={setup} monthly={monthly} />
            <Button size="lg" trailingIcon={<ArrowRight size={18} />} onClick={() => setCheckoutOpen(true)}>
              Review & rent
            </Button>
          </div>
        </aside>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-4 border-t border-line-subtle bg-card/95 px-4 py-3 pb-[calc(0.75rem+var(--safe-bottom))] backdrop-blur lg:hidden">
        <SetupTotal setup={setup} monthly={monthly} />
        <Button trailingIcon={<ArrowRight size={18} />} onClick={() => setCheckoutOpen(true)}>
          Review & rent
        </Button>
      </div>

      <CheckoutDrawer
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        setup={setup}
        side={isDesktop ? "right" : "bottom"}
      />
      <Toaster position="top-center" />
    </div>
  );
}

function SetupTotal({ setup, monthly }: { setup: Setup; monthly: number }) {
  const desk = findProduct("desk", setup.desk);
  const extras = [
    setup.monitors.length && `${setup.monitors.length}/${MAX_MONITORS} monitors`,
    setup.keyboard && "keyboard",
    setup.mouse && "mouse",
    setup.extras.length && `${setup.extras.length} ${setup.extras.length === 1 ? "extra" : "extras"}`,
  ].filter(Boolean);
  return (
    <div className="flex min-w-0 flex-col">
      <span className="text-lg font-semibold tabular-nums text-fg">
        {formatIDR(monthly)}
        <span className="text-sm font-normal text-fg-muted">/mo</span>
      </span>
      <span className="truncate text-xs text-fg-muted">
        {desk?.name}
        {extras.length ? ` + ${extras.join(", ")}` : ""}
      </span>
    </div>
  );
}
