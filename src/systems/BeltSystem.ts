import type { System } from "../core/types";
import { world } from "../core/World";
import { Belt } from "../entities/Belt";
import { BeltItem } from "../entities/BeltItem";
import { isItemReceiver } from "../entities/IItemReceiver";

const BELT_TILES_PER_SEC = 1;
const MIN_SPACING = 0.5; // minimum progress gap between items on the same belt

const DIRECTION: Record<0 | 90 | 180 | 270, [number, number]> = {
  0:   [1,  0],
  90:  [0,  1],
  180: [-1, 0],
  270: [0, -1],
};

export class BeltSystem implements System {
  public update(dt: number): void {
    const dProgress = (dt / 60) * BELT_TILES_PER_SEC;

    const items = [...world.getAll((e): e is BeltItem => e instanceof BeltItem)];

    // Group items per belt, sorted descending by progress (front of belt first)
    const beltItems = new Map<string, BeltItem[]>();
    for (const item of items) {
      let list = beltItems.get(item.currentBeltId);
      if (!list) { list = []; beltItems.set(item.currentBeltId, list); }
      list.push(item);
    }
    for (const list of beltItems.values()) {
      list.sort((a, b) => b.progress - a.progress);
    }

    // Belts whose entry zone is occupied this frame — prevents two converging items
    // from both entering the same belt in the same frame.
    const entryOccupied = new Set<string>();
    for (const [beltId, list] of beltItems) {
      if (list.some(i => i.progress < MIN_SPACING)) entryOccupied.add(beltId);
    }

    // Process globally front-first so transfers free up space before followers advance
    items.sort((a, b) => b.progress - a.progress);

    for (const item of items) {
      const belt = world.get<Belt>(item.currentBeltId);
      if (!belt) { world.unregister(item.id); continue; }

      const [dx, dy] = DIRECTION[belt.rotation];
      const next = world.getSpatial(belt.gridX + dx, belt.gridY + dy);

      const list = beltItems.get(item.currentBeltId)!;
      const idx = list.indexOf(item);
      const leader = idx > 0 ? list[idx - 1] : null;

      // Cap: maintain MIN_SPACING to the leader. For the front item, also enforce
      // cross-belt spacing: if next belt has a backmost item at progress p, this item
      // must stop at p + (1 - MIN_SPACING) so the across-boundary gap stays >= MIN_SPACING.
      let cap: number;
      if (leader) {
        cap = leader.progress - MIN_SPACING;
      } else if (next instanceof Belt) {
        const nextList = beltItems.get(next.id);
        const backOfNext = nextList ? nextList[nextList.length - 1] : null;
        cap = backOfNext ? Math.min(1, backOfNext.progress + (1 - MIN_SPACING)) : 1;
      } else {
        cap = 1;
      }

      if (item.progress < cap) {
        item.progress = Math.min(cap, item.progress + dProgress);
      }

      if (item.progress >= 1) {
        if (next instanceof Belt) {
          if (!entryOccupied.has(next.id)) {
            entryOccupied.add(next.id);
            let nextList = beltItems.get(next.id);
            if (!nextList) { nextList = []; beltItems.set(next.id, nextList); }
            list.splice(idx, 1);
            item.currentBeltId = next.id;
            item.progress -= 1;
            nextList.push(item);
          }
          // else: entry occupied — item waits at progress=1
        } else if (isItemReceiver(next)) {
          if (next.acceptItem(item)) {
            world.unregister(item.id);
            list.splice(idx, 1);
          }
          continue;
        }
        // else: no next entity — item waits at progress=1 and clogs backward
      }

      const cur = world.get<Belt>(item.currentBeltId)!;
      const [cdx, cdy] = DIRECTION[cur.rotation];
      if (cdx !== 0) {
        item.x = cur.gridX + (cdx > 0 ? item.progress : 1 - item.progress);
        item.y = cur.gridY + 0.5;
      } else {
        item.x = cur.gridX + 0.5;
        item.y = cur.gridY + (cdy > 0 ? item.progress : 1 - item.progress);
      }
    }
  }
}
