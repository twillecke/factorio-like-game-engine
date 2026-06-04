import type { Entity, System } from "../core/types";
import type { ToolType } from "../core/toolTypes";
import { world } from "../core/World";
import { Marker } from "../entities/Marker";
import { Pipe } from "../entities/Pipe";
import { Pump } from "../entities/Pump";
import { Tank } from "../entities/Tank";

function isMarker(e: Entity): e is Marker {
  return e instanceof Marker;
}

export class PlacementSystem implements System {
  private tool: ToolType = "pipe";

  constructor(private chunkId: string) {}

  setTool(tool: ToolType): void {
    this.tool = tool;
  }

  private isOccupied(gridX: number, gridY: number): boolean {
    // Check markers
    const onMarker = world.getAll(isMarker).some(
      (m) =>
        gridX >= m.gridX &&
        gridX < m.gridX + Marker.CELL_SIZE &&
        gridY >= m.gridY &&
        gridY < m.gridY + Marker.CELL_SIZE,
    );
    if (onMarker) return true;

    // Check 1x1 pipe
    if (world.get(`user-${gridX}-${gridY}`)) return true;

    // Check 2x2 large objects — any top-left that covers (gridX, gridY)
    for (let dx = 0; dx < 2; dx++) {
      for (let dy = 0; dy < 2; dy++) {
        const ox = gridX - dx;
        const oy = gridY - dy;
        if (world.get(`pump-${ox}-${oy}`) || world.get(`tank-${ox}-${oy}`)) return true;
      }
    }

    return false;
  }

  placeAt(gridX: number, gridY: number): void {
    if (this.tool === "pipe") {
      if (this.isOccupied(gridX, gridY)) return;
      const id = `user-${gridX}-${gridY}`;
      world.register(new Pipe(id, gridX, gridY, this.chunkId));
      return;
    }

    // 2x2 placement — check all 4 cells
    for (let dx = 0; dx < 2; dx++) {
      for (let dy = 0; dy < 2; dy++) {
        if (this.isOccupied(gridX + dx, gridY + dy)) return;
      }
    }

    const id = `${this.tool}-${gridX}-${gridY}`;
    if (world.get(id)) return;

    if (this.tool === "pump") {
      world.register(new Pump(id, gridX, gridY, this.chunkId));
    } else {
      world.register(new Tank(id, gridX, gridY, this.chunkId));
    }
  }

  removeAt(gridX: number, gridY: number): void {
    // Try 1x1 pipe
    const pipeId = `user-${gridX}-${gridY}`;
    if (world.get(pipeId)) {
      world.unregister(pipeId);
      return;
    }

    // Find large object whose 2x2 footprint covers this cell
    for (let dx = 0; dx < 2; dx++) {
      for (let dy = 0; dy < 2; dy++) {
        const ox = gridX - dx;
        const oy = gridY - dy;
        const pumpId = `pump-${ox}-${oy}`;
        const tankId = `tank-${ox}-${oy}`;
        if (world.get(pumpId)) {
          world.unregister(pumpId);
          return;
        }
        if (world.get(tankId)) {
          world.unregister(tankId);
          return;
        }
      }
    }
  }

  toggleAt(gridX: number, gridY: number): void {
    if (this.isOccupied(gridX, gridY)) {
      this.removeAt(gridX, gridY);
      return;
    }
    this.placeAt(gridX, gridY);
  }

  update(_dt: number): void {}
}
