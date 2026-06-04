import type { Entity, System } from "../core/types";
import { world } from "../core/World";
import { Marker } from "../entities/Marker";
import { UserObject } from "../entities/UserObject";
import type { WorldRenderer } from "../renderers/WorldRenderer";

function isMarker(e: Entity): e is Marker {
  return e instanceof Marker;
}

export class PlacementSystem implements System {
  private placedIds = new Set<string>();

  constructor(
    private worldRenderer: WorldRenderer,
    private chunkId: string,
  ) {}

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
    if (this.placedIds.has(id)) {
      world.unregister(id);
      this.worldRenderer.removeUserObject(id);
      this.placedIds.delete(id);
      return;
    }
    const obj = new UserObject(id, gridX, gridY);
    world.register(obj);
    this.worldRenderer.addUserObject(obj, this.chunkId);
    this.placedIds.add(id);
  }

  update(_dt: number): void {}

  destroy(): void {
    this.placedIds.clear();
  }
}
