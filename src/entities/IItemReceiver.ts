import type { BeltItem } from "./BeltItem";

export interface IItemReceiver {
  acceptItem(item: BeltItem): boolean;
}

export function isItemReceiver(e: unknown): e is IItemReceiver {
  return e != null && typeof (e as IItemReceiver).acceptItem === "function";
}
