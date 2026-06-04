import type { System } from "../core/types";
import type { ToolType } from "../core/toolTypes";
import { world } from "../core/World";
import { TOOL_DEFS } from "../entities/tools";
import type { PreviewRenderer } from "../renderers/PreviewRenderer";

export class PlacementSystem implements System {
  private tool: ToolType | null = "pipe";

  constructor(private chunkId: string, private preview: PreviewRenderer) {}

  setTool(tool: ToolType | null): void {
    this.tool = tool;
    if (!tool) this.preview.clear();
  }

  hoverAt(gridX: number, gridY: number): void {
    if (!this.tool) return;
    this.preview.update(this.tool, gridX, gridY, this.canPlace(gridX, gridY));
  }

  clearHover(): void {
    this.preview.clear();
  }

  placeAt(gridX: number, gridY: number): void {
    if (!this.tool) return;
    const def = TOOL_DEFS[this.tool];

    for (let dx = 0; dx < def.cellSize; dx++)
      for (let dy = 0; dy < def.cellSize; dy++)
        if (this.isOccupied(gridX + dx, gridY + dy)) return;

    const id = `${def.idPrefix}-${gridX}-${gridY}`;
    if (world.get(id)) return;
    world.register(def.create(id, gridX, gridY, this.chunkId));
  }

  removeAt(gridX: number, gridY: number): void {
    for (const [, def] of Object.entries(TOOL_DEFS)) {
      const id = `${def.idPrefix}-${gridX}-${gridY}`;
      if (world.get(id)) { world.unregister(id); return; }
    }

    for (let dx = 0; dx < 2; dx++) {
      for (let dy = 0; dy < 2; dy++) {
        const ox = gridX - dx;
        const oy = gridY - dy;
        for (const [, def] of Object.entries(TOOL_DEFS)) {
          if (def.cellSize < 2) continue;
          const id = `${def.idPrefix}-${ox}-${oy}`;
          if (world.get(id)) { world.unregister(id); return; }
        }
      }
    }
  }

  update(_dt: number): void {}

  private canPlace(gridX: number, gridY: number): boolean {
    if (!this.tool) return false;
    const { cellSize } = TOOL_DEFS[this.tool];
    for (let dx = 0; dx < cellSize; dx++)
      for (let dy = 0; dy < cellSize; dy++)
        if (this.isOccupied(gridX + dx, gridY + dy)) return false;
    return true;
  }

  private isOccupied(gridX: number, gridY: number): boolean {
    for (const [, def] of Object.entries(TOOL_DEFS)) {
      if (world.get(`${def.idPrefix}-${gridX}-${gridY}`)) return true;
    }

    for (let dx = 0; dx < 2; dx++) {
      for (let dy = 0; dy < 2; dy++) {
        const ox = gridX - dx;
        const oy = gridY - dy;
        for (const [, def] of Object.entries(TOOL_DEFS)) {
          if (def.cellSize < 2) continue;
          if (world.get(`${def.idPrefix}-${ox}-${oy}`)) return true;
        }
      }
    }

    return false;
  }
}
