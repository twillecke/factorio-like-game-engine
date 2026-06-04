import type { System } from "../core/types";
import type { AssetType } from "../core/assetTypes";
import { world } from "../core/World";
import { ASSET_DEFS } from "../entities/Assets";
import { CHUNK_SIZE } from "../entities/Chunk";
import { GridEntity } from "../entities/GridEntity";
import type { PreviewRenderer } from "../renderers/PreviewRenderer";

export class PlacementSystem implements System {
  private tool: AssetType | null = "pipe";

  constructor(private chunkId: string, private preview: PreviewRenderer) {}

  public setTool(tool: AssetType | null): void {
    this.tool = tool;
    if (!tool) this.preview.clear();
  }

  public hoverAt(gridX: number, gridY: number): void {
    if (!this.tool) return;
    this.preview.update(this.tool, gridX, gridY, this.canPlace(gridX, gridY));
  }

  public clearHover(): void {
    this.preview.clear();
  }

  public placeAt(gridX: number, gridY: number): void {
    if (!this.tool) return;
    if (!this.canPlace(gridX, gridY)) return;
    const def = ASSET_DEFS[this.tool];

    const id = `${def.idPrefix}-${gridX}-${gridY}`;
    const entity = def.create(id, gridX, gridY, this.chunkId);
    world.register(entity);
    for (let dx = 0; dx < def.cellWidth; dx++)
      for (let dy = 0; dy < def.cellHeight; dy++)
        world.setSpatial(gridX + dx, gridY + dy, entity);
  }

  public removeAt(gridX: number, gridY: number): void {
    const entity = world.getSpatial<GridEntity>(gridX, gridY);
    if (!entity) return;
    for (let dx = 0; dx < entity.cellWidth; dx++)
      for (let dy = 0; dy < entity.cellHeight; dy++)
        world.clearSpatial(entity.gridX + dx, entity.gridY + dy);
    world.unregister(entity.id);
  }

  public update(_dt: number): void {}

  private canPlace(gridX: number, gridY: number): boolean {
    if (!this.tool) return false;
    const def = ASSET_DEFS[this.tool];
    for (let dx = 0; dx < def.cellWidth; dx++)
      for (let dy = 0; dy < def.cellHeight; dy++)
        if (this.isOutOfBounds(gridX + dx, gridY + dy) || this.isOccupied(gridX + dx, gridY + dy)) return false;
    return true;
  }

  private isOccupied(x: number, y: number): boolean {
    return world.getSpatial(x, y) !== undefined;
  }

  private isOutOfBounds(x: number, y: number): boolean {
    return x < 0 || y < 0 || x >= CHUNK_SIZE || y >= CHUNK_SIZE;
  }
}
