import type { System } from "../core/types";
import { world } from "../core/World";
import { Belt } from "../entities/Belt";

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
    const items = world.getAllItems();

    for (const item of items) {
      const belt = world.get<Belt>(item.currentBeltId);
      if (!belt) { world.unregisterItem(item.id); continue; }

      item.progress += dProgress;
      const [dx, dy] = DIRECTION[belt.rotation];

      if (item.progress >= 1) {
        const nextX = belt.gridX + dx;
        const nextY = belt.gridY + dy;
        const next = world.getSpatial<Belt>(nextX, nextY);
        if (next instanceof Belt) {
          item.currentBeltId = next.id;
          item.progress -= 1;
        } else {
          world.unregisterItem(item.id);
          continue;
        }
      }

      const currentBelt = world.get<Belt>(item.currentBeltId)!;
      const [cdx, cdy] = DIRECTION[currentBelt.rotation];
      if (cdx !== 0) {
        item.x = currentBelt.gridX + (cdx > 0 ? item.progress : 1 - item.progress);
        item.y = currentBelt.gridY + 0.5;
      } else {
        item.x = currentBelt.gridX + 0.5;
        item.y = currentBelt.gridY + (cdy > 0 ? item.progress : 1 - item.progress);
      }
    }
  }
}
