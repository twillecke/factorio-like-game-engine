import type { Entity, System } from "../core/types";
import { world } from "../core/World";
import { Marker } from "../entities/Marker";
import { Pipe } from "../entities/Pipe";

function isMarker(e: Entity): e is Marker {
  return e instanceof Marker;
}

export class PlacementSystem implements System {
  constructor(private chunkId: string) {}

  private isBlocked(gridX: number, gridY: number): boolean {
    return world.getAll(isMarker).some(
      (m) =>
        gridX >= m.gridX &&
        gridX < m.gridX + Marker.CELL_SIZE &&
        gridY >= m.gridY &&
        gridY < m.gridY + Marker.CELL_SIZE,
    );
  }

  placeAt(gridX: number, gridY: number): void {
    if (this.isBlocked(gridX, gridY)) return;
    const id = `user-${gridX}-${gridY}`;
    if (world.get(id)) return;
    world.register(new Pipe(id, gridX, gridY, this.chunkId));
  }

  removeAt(gridX: number, gridY: number): void {
    world.unregister(`user-${gridX}-${gridY}`);
  }

  toggleAt(gridX: number, gridY: number): void {
    if (this.isBlocked(gridX, gridY)) return;
    const id = `user-${gridX}-${gridY}`;
    if (world.get(id)) {
      world.unregister(id);
      return;
    }
    world.register(new Pipe(id, gridX, gridY, this.chunkId));
  }

  update(_dt: number): void {}
}
