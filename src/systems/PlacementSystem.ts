import type { System } from "../core/types";
import type { ToolType } from "../core/toolTypes";
import { world } from "../core/World";
import { TOOL_DEFS } from "../entities/tools";
import { UserObject } from "../entities/UserObject";
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
    const entity = def.create(id, gridX, gridY, this.chunkId);
    world.register(entity);
    for (let dx = 0; dx < def.cellSize; dx++)
      for (let dy = 0; dy < def.cellSize; dy++)
        world.setSpatial(gridX + dx, gridY + dy, entity);
  }

  removeAt(gridX: number, gridY: number): void {
    const entity = world.getSpatial<UserObject>(gridX, gridY);
    if (!entity) return;
    for (let dx = 0; dx < entity.cellSize; dx++)
      for (let dy = 0; dy < entity.cellSize; dy++)
        world.clearSpatial(entity.gridX + dx, entity.gridY + dy);
    world.unregister(entity.id);
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

  private isOccupied(x: number, y: number): boolean {
    return world.getSpatial(x, y) !== undefined;
  }
}
