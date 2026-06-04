import { Container, Graphics } from "pixi.js";
import type { AssetType } from "../entities/assetTypes";
import { ASSET_DEFS } from "../entities/registry";
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

  public update(asset: AssetType, gridX: number, gridY: number, isValid: boolean, rotation: number): void {
    const def = ASSET_DEFS[asset];
    const isRotated = rotation === 90 || rotation === 270;
    const w = (isRotated ? def.cellHeight : def.cellWidth) * TILE_SIZE;
    const h = (isRotated ? def.cellWidth : def.cellHeight) * TILE_SIZE;
    const color = isValid ? ASSET_COLOR[asset] : INVALID_COLOR;
    this.graphics.clear();
    this.graphics.rect(0, 0, w, h).fill({ color, alpha: 0.5 });
    this.drawArrow(w / 2, h / 2, rotation);
    this.graphics.x = gridX * TILE_SIZE;
    this.graphics.y = gridY * TILE_SIZE;
  }

  private drawArrow(cx: number, cy: number, rotation: number): void {
    const s = TILE_SIZE * 0.3;
    let tip: [number, number];
    let b1: [number, number];
    let b2: [number, number];
    switch (rotation) {
      case 0:   tip = [cx + s, cy]; b1 = [cx - s, cy - s]; b2 = [cx - s, cy + s]; break;
      case 90:  tip = [cx, cy + s]; b1 = [cx - s, cy - s]; b2 = [cx + s, cy - s]; break;
      case 180: tip = [cx - s, cy]; b1 = [cx + s, cy - s]; b2 = [cx + s, cy + s]; break;
      case 270: tip = [cx, cy - s]; b1 = [cx - s, cy + s]; b2 = [cx + s, cy + s]; break;
      default: return;
    }
    this.graphics
      .moveTo(tip[0], tip[1])
      .lineTo(b1[0], b1[1])
      .lineTo(b2[0], b2[1])
      .closePath()
      .fill({ color: 0xffffff, alpha: 0.8 });
  }

  public clear(): void {
    this.graphics.clear();
  }

  public destroy(): void {
    this.graphics.destroy();
  }
}
