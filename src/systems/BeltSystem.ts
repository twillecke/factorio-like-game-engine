import type { System } from "../core/types";
import { world } from "../core/World";
import { Belt } from "../entities/Belt";
import { BeltItem } from "../entities/BeltItem";
import { isItemReceiver } from "../entities/IItemReceiver";

const BELT_TILES_PER_SEC = 1;
const MIN_SPACING = 0.5;

const DIRECTION: Record<0 | 90 | 180 | 270, [number, number]> = {
  0:   [1,  0],
  90:  [0,  1],
  180: [-1, 0],
  270: [0, -1],
};

export class BeltSystem implements System {
  public update(dt: number): void {
    const dProgress = (dt / 60) * BELT_TILES_PER_SEC;
    const beltItems = this.groupByBelt();
    const entryOccupied = this.occupiedEntries(beltItems);

    const items = [...beltItems.values()].flat();
    items.sort((a, b) => b.progress - a.progress); // front-first: transfers free space before followers advance

    for (const item of items) {
      const belt = world.get<Belt>(item.currentBeltId);
      if (!belt) { world.unregister(item.id); continue; }

      const [dx, dy] = DIRECTION[belt.rotation];
      const next = world.getSpatial(belt.gridX + dx, belt.gridY + dy);
      const nextBelt = next instanceof Belt ? next : null;

      // Turning items enter the next belt at its center (0.5) to avoid visual jumps.
      const entryPoint = nextBelt && belt.rotation !== nextBelt.rotation ? 0.5 : 0;

      const list = beltItems.get(item.currentBeltId)!;
      const idx = list.indexOf(item);
      const leader = idx > 0 ? list[idx - 1] : null;
      const cap = this.cap(leader, nextBelt, entryPoint, beltItems);

      if (item.progress < cap) item.progress = Math.min(cap, item.progress + dProgress);

      if (item.progress >= 1) {
        if (nextBelt) {
          this.tryEnter(item, list, idx, nextBelt, entryPoint, beltItems, entryOccupied);
        } else if (isItemReceiver(next)) {
          if (next.acceptItem(item)) { world.unregister(item.id); list.splice(idx, 1); continue; }
        }
        // else: no next entity — item waits at progress=1, clog propagates backward
      }

      this.syncPosition(item);
    }
  }

  /** Group all belt items by their current belt, sorted front-first (progress desc). */
  private groupByBelt(): Map<string, BeltItem[]> {
    const map = new Map<string, BeltItem[]>();
    for (const item of world.getAll((e): e is BeltItem => e instanceof BeltItem)) {
      let list = map.get(item.currentBeltId);
      if (!list) { list = []; map.set(item.currentBeltId, list); }
      list.push(item);
    }
    for (const list of map.values()) list.sort((a, b) => b.progress - a.progress);
    return map;
  }

  /** Belts that already have an item occupying the entry zone this frame. */
  private occupiedEntries(beltItems: Map<string, BeltItem[]>): Set<string> {
    const occupied = new Set<string>();
    for (const [id, list] of beltItems) {
      if (list.some(i => i.progress < MIN_SPACING)) occupied.add(id);
    }
    return occupied;
  }

  /**
   * Maximum progress this item may reach on its current belt.
   * Same-belt: stay MIN_SPACING behind leader.
   * Cross-belt: derived so the gap after entry is >= MIN_SPACING.
   *   cap = back.progress - entryPoint - MIN_SPACING + 1
   */
  private cap(
    leader: BeltItem | null,
    nextBelt: Belt | null,
    entryPoint: number,
    beltItems: Map<string, BeltItem[]>,
  ): number {
    if (leader) return leader.progress - MIN_SPACING;
    if (nextBelt) {
      const nextList = beltItems.get(nextBelt.id);
      const back = nextList ? nextList[nextList.length - 1] : null;
      if (back) return Math.min(1, back.progress - entryPoint - MIN_SPACING + 1);
    }
    return 1;
  }

  /** Attempt to move item onto nextBelt. No-ops if entry is blocked. */
  private tryEnter(
    item: BeltItem,
    list: BeltItem[],
    idx: number,
    nextBelt: Belt,
    entryPoint: number,
    beltItems: Map<string, BeltItem[]>,
    entryOccupied: Set<string>,
  ): void {
    let nextList = beltItems.get(nextBelt.id);
    if (!nextList) { nextList = []; beltItems.set(nextBelt.id, nextList); }

    const back = nextList[nextList.length - 1];
    const entryFree = !entryOccupied.has(nextBelt.id) &&
                      (!back || back.progress >= entryPoint + MIN_SPACING);
    if (!entryFree) return;

    entryOccupied.add(nextBelt.id);
    list.splice(idx, 1);
    item.currentBeltId = nextBelt.id;
    item.progress = entryPoint;
    nextList.push(item);
  }

  private syncPosition(item: BeltItem): void {
    const belt = world.get<Belt>(item.currentBeltId)!;
    const [dx, dy] = DIRECTION[belt.rotation];
    if (dx !== 0) {
      item.x = belt.gridX + (dx > 0 ? item.progress : 1 - item.progress);
      item.y = belt.gridY + 0.5;
    } else {
      item.x = belt.gridX + 0.5;
      item.y = belt.gridY + (dy > 0 ? item.progress : 1 - item.progress);
    }
  }
}
