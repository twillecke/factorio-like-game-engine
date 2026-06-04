import type { System } from "../core/types";
import type { AssetType } from "../core/assetTypes";
import { world } from "../core/World";
import { ASSET_DEFS } from "../entities/Assets";
import { CHUNK_SIZE } from "../entities/Chunk";
import { GridEntity } from "../entities/GridEntity";
import type { PreviewRenderer } from "../renderers/PreviewRenderer";

export class PlacementSystem implements System {
  private tool: AssetType | null = "pipe";
  private rotation: 0 | 90 | 180 | 270 = 0;
  private lastHoverX: number | null = null;
  private lastHoverY: number | null = null;

  constructor(private chunkId: string, private preview: PreviewRenderer) {}

  public setTool(tool: AssetType | null): void {
    this.tool = tool;
    if (!tool) this.preview.clear();
  }

  public rotate(): void {
    const cycle: Array<0 | 90 | 180 | 270> = [0, 90, 180, 270];
    this.rotation = cycle[(cycle.indexOf(this.rotation) + 1) % 4];
    if (this.tool && this.lastHoverX !== null && this.lastHoverY !== null)
      this.preview.update(this.tool, this.lastHoverX, this.lastHoverY, this.canPlace(this.lastHoverX, this.lastHoverY), this.rotation);
  }

  public hoverAt(gridX: number, gridY: number): void {
    if (!this.tool) return;
    this.lastHoverX = gridX;
    this.lastHoverY = gridY;
    this.preview.update(this.tool, gridX, gridY, this.canPlace(gridX, gridY), this.rotation);
  }

  public clearHover(): void {
    this.preview.clear();
  }

  public placeAt(gridX: number, gridY: number): void {
    if (!this.tool) return;
    if (!this.canPlace(gridX, gridY)) return;
    const def = ASSET_DEFS[this.tool];
    const id = `${def.idPrefix}-${gridX}-${gridY}`;
    const entity = def.create(id, gridX, gridY, this.chunkId, this.rotation);
    world.register(entity);
    for (let dx = 0; dx < entity.effectiveCellWidth; dx++)
      for (let dy = 0; dy < entity.effectiveCellHeight; dy++)
        world.setSpatial(gridX + dx, gridY + dy, entity);
  }

  public removeAt(gridX: number, gridY: number): void {
    const entity = world.getSpatial<GridEntity>(gridX, gridY);
    if (!entity) return;
    for (let dx = 0; dx < entity.effectiveCellWidth; dx++)
      for (let dy = 0; dy < entity.effectiveCellHeight; dy++)
        world.clearSpatial(entity.gridX + dx, entity.gridY + dy);
    world.unregister(entity.id);
  }

  public update(_dt: number): void {}

  private canPlace(gridX: number, gridY: number): boolean {
    if (!this.tool) return false;
    const def = ASSET_DEFS[this.tool];
    const ew = (this.rotation === 90 || this.rotation === 270) ? def.cellHeight : def.cellWidth;
    const eh = (this.rotation === 90 || this.rotation === 270) ? def.cellWidth : def.cellHeight;
    for (let dx = 0; dx < ew; dx++)
      for (let dy = 0; dy < eh; dy++)
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
