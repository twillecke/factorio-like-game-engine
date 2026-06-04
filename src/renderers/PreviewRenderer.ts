import { Container, Graphics } from "pixi.js";
import type { AssetType } from "../core/assetTypes";
import { ASSET_DEFS } from "../entities/Assets";
import { TILE_SIZE } from "./ChunkRenderer";

const ASSET_COLOR: Record<AssetType, number> = {
  pipe: 0xf1c40f,
  pump: 0x27ae60,
  tank: 0xe67e22,
  steamEngine: 0x2980b9,
};

const INVALID_COLOR = 0xff4444;

export class PreviewRenderer {
  private graphics = new Graphics();
  private container: Container | null = null;

  public attach(container: Container): void {
    if (this.container) this.container.removeChild(this.graphics);
    this.container = container;
    container.sortableChildren = true;
    this.graphics.zIndex = 1000;
    container.addChild(this.graphics);
  }

  public update(asset: AssetType, gridX: number, gridY: number, isValid: boolean): void {
    const def = ASSET_DEFS[asset];
    const w = def.cellWidth * TILE_SIZE;
    const h = def.cellHeight * TILE_SIZE;
    const color = isValid ? ASSET_COLOR[asset] : INVALID_COLOR;
    this.graphics.clear();
    this.graphics.rect(0, 0, w, h).fill({ color, alpha: 0.5 });
    this.graphics.x = gridX * TILE_SIZE;
    this.graphics.y = gridY * TILE_SIZE;
  }

  public clear(): void {
    this.graphics.clear();
  }

  public destroy(): void {
    this.graphics.destroy();
  }
}
