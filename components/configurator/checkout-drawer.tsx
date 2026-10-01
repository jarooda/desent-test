"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/jl/button";
import { Drawer } from "@/components/jl/drawer";
import { SegmentedControl } from "@/components/jl/segmented-control";
import { Stat } from "@/components/jl/stat";
import { toast } from "@/components/jl/toast";
import { formatIDR, type Category, type Product } from "@/lib/catalog";
import { setupItems, type Setup } from "@/lib/setup";

/** Rental terms; longer terms get a placeholder discount. */
const TERMS = [
  { months: 1, discount: 0 },
  { months: 3, discount: 0.05 },
  { months: 6, discount: 0.1 },
  { months: 12, discount: 0.15 },
] as const;

const CATEGORY_LABEL: Record<Category, string> = {
  desk: "Desk",
  chair: "Chair",
  monitor: "Monitor",
  keyboard: "Keyboard",
  mouse: "Mouse",
  extra: "Extra",
};

interface CheckoutDrawerProps {
  open: boolean;
  onClose: () => void;
  setup: Setup;
  side: "right" | "bottom";
}

export function CheckoutDrawer({ open, onClose, setup, side }: CheckoutDrawerProps) {
  const [months, setMonths] = useState<number>(3);
  const term = TERMS.find((t) => t.months === months) ?? TERMS[0];
  const items = setupItems(setup);
  const lines = groupLines(items);
  const monthly = items.reduce((sum, p) => sum + p.pricePerMonth, 0);
  const discountedMonthly = Math.round(monthly * (1 - term.discount));
  const total = discountedMonthly * term.months;

  function rent() {
    onClose();
    toast.success(
      `We'll reach out within 24h to schedule delivery and setup. Total ${formatIDR(total)} for ${term.months} ${term.months === 1 ? "month" : "months"}.`,
      { title: "Your workspace is reserved", duration: 6000 }
    );
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side={side}
      size={side === "right" ? 440 : undefined}
      title="Your workspace"
      description={`${items.length} items, delivered and set up anywhere in Bali`}
      footer={
        <Button size="lg" fullWidth onClick={rent}>
          Rent for {formatIDR(total)}
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <ul className="flex flex-col divide-y divide-line-subtle">
          {lines.map(({ product: p, qty }) => (
            <li key={`${p.category}-${p.id}`} className="flex items-center gap-3 py-3">
              <div className="relative size-14 flex-none overflow-hidden rounded-xl bg-sunken">
                <Image src={p.thumb} alt="" fill sizes="56px" className="object-contain p-1" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-xs text-fg-subtle">{CATEGORY_LABEL[p.category]}</span>
                <span className="truncate font-medium text-fg">
                  {qty > 1 && <span className="text-fg-muted">{qty}× </span>}
                  {p.name}
                </span>
              </div>
              <span className="text-sm tabular-nums text-fg-muted">{formatIDR(p.pricePerMonth * qty)}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-fg">Rental period</span>
          <SegmentedControl
            aria-label="Rental period"
            fullWidth
            value={String(months)}
            onChange={(v) => setMonths(Number(v))}
            options={TERMS.map((t) => ({ value: String(t.months), label: `${t.months} mo` }))}
          />
        </div>

        <Stat.Group columns={2}>
          <Stat
            size="sm"
            label="Per month"
            value={formatIDR(discountedMonthly)}
            delta={term.discount ? `-${term.discount * 100}%` : undefined}
            deltaTone="positive"
            caption={term.discount ? `was ${formatIDR(monthly)}` : "No commitment"}
          />
          <Stat
            size="sm"
            label={`Total, ${term.months} ${term.months === 1 ? "month" : "months"}`}
            value={formatIDR(total)}
            caption="Delivery & setup included"
          />
        </Stat.Group>
      </div>
    </Drawer>
  );
}

/** Collapse repeated products (e.g. two identical monitors) into one line. */
function groupLines(items: Product[]) {
  const lines = new Map<string, { product: Product; qty: number }>();
  for (const p of items) {
    const key = `${p.category}:${p.id}`;
    const line = lines.get(key);
    if (line) line.qty += 1;
    else lines.set(key, { product: p, qty: 1 });
  }
  return [...lines.values()];
}
