import { Container, Graphics } from "pixi.js";
import type { BeltItem } from "../entities/BeltItem";
import { TILE_SIZE } from "./ChunkRenderer";
import type { IEntityRenderer } from "./IEntityRenderer";

const ITEM_COLORS: Record<string, number> = {
  coal: 0x2C2C2C,
};
const RADIUS = 5;

export class ItemRenderer implements IEntityRenderer {
  public readonly container: Container;
  private readonly graphics: Graphics;

  constructor(private readonly item: BeltItem) {
    this.container = new Container();
    this.graphics = new Graphics();
    const color = ITEM_COLORS[item.itemType] ?? 0x888888;
    this.graphics.circle(0, 0, RADIUS).fill({ color });
    this.graphics.circle(0, 0, RADIUS).stroke({ width: 1.5, color: 0xffffff, alpha: 0.6 });
    this.container.addChild(this.graphics);
    this.container.x = item.x * TILE_SIZE;
    this.container.y = item.y * TILE_SIZE;
  }

  public sync(): void {
    this.container.x = this.item.x * TILE_SIZE;
    this.container.y = this.item.y * TILE_SIZE;
  }

  public destroy(): void {
    this.graphics.destroy();
    this.container.destroy();
  }
}
