import type { System } from "../core/types";
import { world } from "../core/World";
import { Belt } from "../entities/Belt";
import { BeltItem } from "../entities/BeltItem";
import { isItemReceiver } from "../entities/IItemReceiver";

const BELT_TILES_PER_SEC = 1;

const DIRECTION: Record<0 | 90 | 180 | 270, [number, number]> = {
  0:   [1,  0],
  90:  [0,  1],
  180: [-1, 0],
  270: [0, -1],
};

export class BeltSystem implements System {
  public update(dt: number): void {
    const dProgress = (dt / 60) * BELT_TILES_PER_SEC;

    for (const item of world.getAll((e): e is BeltItem => e instanceof BeltItem)) {
      const belt = world.get<Belt>(item.currentBeltId);
      if (!belt) { world.unregister(item.id); continue; }

      if (item.progress < 1) item.progress = Math.min(1, item.progress + dProgress);

      if (item.progress >= 1) {
        const [dx, dy] = DIRECTION[belt.rotation];
        const next = world.getSpatial(belt.gridX + dx, belt.gridY + dy);

        if (next instanceof Belt) {
          item.currentBeltId = next.id;
          item.progress -= 1;
        } else if (isItemReceiver(next)) {
          if (next.acceptItem(item)) world.unregister(item.id);
          // else: receiver blocked, item waits at progress=1
          continue;
        } else {
          world.unregister(item.id);
          continue;
        }
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
