import { catalog, findProduct, MAX_MONITORS, type Category, type Product } from "./catalog";

/** A workspace setup. Lives in the URL so it survives reloads and can be shared. */
export interface Setup {
  desk: string;
  chair: string;
  monitors: string[];
  keyboard?: string;
  mouse?: string;
  extras: string[];
}

export const DEFAULT_SETUP: Setup = {
  desk: catalog.desk[0].id,
  chair: catalog.chair[0].id,
  monitors: [],
  extras: [],
};

type Params = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Parse query params, dropping anything that isn't in the catalog. */
export function parseSetup(params: Params): Setup {
  const desk = first(params.desk);
  const chair = first(params.chair);
  const monitors = (first(params.monitors) ?? "")
    .split(",")
    .filter((id) => findProduct("monitor", id))
    .slice(0, MAX_MONITORS);
  const extras = [...new Set((first(params.extras) ?? "").split(","))].filter((id) =>
    findProduct("extra", id)
  );
  const keyboard = first(params.keyboard);
  const mouse = first(params.mouse);

  return {
    desk: findProduct("desk", desk) ? desk! : DEFAULT_SETUP.desk,
    chair: findProduct("chair", chair) ? chair! : DEFAULT_SETUP.chair,
    monitors,
    keyboard: findProduct("keyboard", keyboard) ? keyboard : undefined,
    mouse: findProduct("mouse", mouse) ? mouse : undefined,
    extras,
  };
}

export function serializeSetup(setup: Setup): string {
  const q = new URLSearchParams({ desk: setup.desk, chair: setup.chair });
  if (setup.monitors.length) q.set("monitors", setup.monitors.join(","));
  if (setup.keyboard) q.set("keyboard", setup.keyboard);
  if (setup.mouse) q.set("mouse", setup.mouse);
  if (setup.extras.length) q.set("extras", setup.extras.join(","));
  return q.toString();
}

export type SetupAction =
  | { type: "select"; category: "desk" | "chair"; id: string }
  | { type: "toggle"; category: "keyboard" | "mouse"; id: string }
  | { type: "addMonitor"; id: string }
  | { type: "removeMonitor"; index: number }
  | { type: "toggleExtra"; id: string }
  | { type: "reset" };

export function setupReducer(state: Setup, action: SetupAction): Setup {
  switch (action.type) {
    case "select":
      return { ...state, [action.category]: action.id };
    case "toggle":
      return {
        ...state,
        [action.category]: state[action.category] === action.id ? undefined : action.id,
      };
    case "addMonitor":
      if (state.monitors.length >= MAX_MONITORS) return state;
      return { ...state, monitors: [...state.monitors, action.id] };
    case "removeMonitor":
      return { ...state, monitors: state.monitors.filter((_, i) => i !== action.index) };
    case "toggleExtra":
      return {
        ...state,
        extras: state.extras.includes(action.id)
          ? state.extras.filter((id) => id !== action.id)
          : [...state.extras, action.id],
      };
    case "reset":
      return DEFAULT_SETUP;
  }
}

/** Every product in the setup, in display order (monitors may repeat). */
export function setupItems(setup: Setup): Product[] {
  return [
    findProduct("desk", setup.desk),
    findProduct("chair", setup.chair),
    ...setup.monitors.map((id) => findProduct("monitor", id)),
    findProduct("keyboard", setup.keyboard),
    findProduct("mouse", setup.mouse),
    ...setup.extras.map((id) => findProduct("extra", id)),
  ].filter((p): p is Product => p != null);
}

export function countInSetup(setup: Setup, category: Category, id: string): number {
  if (category === "monitor") return setup.monitors.filter((m) => m === id).length;
  if (category === "extra") return setup.extras.includes(id) ? 1 : 0;
  return setup[category] === id ? 1 : 0;
}
