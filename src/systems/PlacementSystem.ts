import type { Entity, System } from "../core/types";
import { world } from "../core/World";
import { Marker } from "../entities/Marker";
import { Pipe } from "../entities/Pipe";

function isMarker(e: Entity): e is Marker {
  return e instanceof Marker;
}

export class PlacementSystem implements System {
  constructor(private chunkId: string) {}

  toggleAt(gridX: number, gridY: number): void {
    const blockedByMarker = world.getAll(isMarker).some(
      (m) =>
        gridX >= m.gridX &&
        gridX < m.gridX + Marker.CELL_SIZE &&
        gridY >= m.gridY &&
        gridY < m.gridY + Marker.CELL_SIZE,
    );
    if (blockedByMarker) return;

    const id = `user-${gridX}-${gridY}`;
    if (world.get(id)) {
      world.unregister(id);
      return;
    }
    world.register(new Pipe(id, gridX, gridY, this.chunkId));
  }

  update(_dt: number): void {}
}
