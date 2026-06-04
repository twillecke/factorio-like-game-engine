import type { System } from "../core/types";
import type { ToolType } from "../core/toolTypes";
import { world } from "../core/World";
import { Pipe } from "../entities/Pipe";
import { Pump } from "../entities/Pump";
import { Tank } from "../entities/Tank";

export class PlacementSystem implements System {
  private tool: ToolType = "pipe";

  constructor(private chunkId: string) {}

  setTool(tool: ToolType): void {
    this.tool = tool;
  }

  private isOccupied(gridX: number, gridY: number): boolean {
    if (world.get(`user-${gridX}-${gridY}`)) return true;

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
    const pipeId = `user-${gridX}-${gridY}`;
    if (world.get(pipeId)) {
      world.unregister(pipeId);
      return;
    }

    for (let dx = 0; dx < 2; dx++) {
      for (let dy = 0; dy < 2; dy++) {
        const ox = gridX - dx;
        const oy = gridY - dy;
        const pumpId = `pump-${ox}-${oy}`;
        const tankId = `tank-${ox}-${oy}`;
        if (world.get(pumpId)) { world.unregister(pumpId); return; }
        if (world.get(tankId)) { world.unregister(tankId); return; }
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
