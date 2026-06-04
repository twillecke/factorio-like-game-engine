import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { Tank } from "../entities/Tank";
import { TILE_SIZE } from "./ChunkRenderer";
import { drawRect } from "./drawRect";
import type { IEntityRenderer } from "./IEntityRenderer";

const LABEL_STYLE = new TextStyle({
  fill: 0xffffff,
  fontSize: 18,
  fontWeight: "bold",
  dropShadow: { color: 0x000000, blur: 4, distance: 0, alpha: 0.6 },
});

const COLOR_EMPTY = 0xe67e22;
const COLOR_FILLED = 0x2980b9;

export class TankRenderer implements IEntityRenderer {
  public readonly container: Container;
  private readonly graphics: Graphics;
  private lastFilled: boolean | null = null;

  constructor(private readonly tank: Tank) {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    this.container.x = tank.gridX * TILE_SIZE;
    this.container.y = tank.gridY * TILE_SIZE;
    this.draw();
    this.addLabel();
  }

  public sync(): void {
    if (this.tank.isFilled === this.lastFilled) return;
    this.lastFilled = this.tank.isFilled;
    this.graphics.clear();
    this.draw();
  }

  private draw(): void {
    const w = this.tank.effectiveCellWidth * TILE_SIZE;
    const h = this.tank.effectiveCellHeight * TILE_SIZE;
    drawRect(this.graphics, w, h, this.tank.isFilled ? COLOR_FILLED : COLOR_EMPTY);
  }

  private addLabel(): void {
    const w = this.tank.effectiveCellWidth * TILE_SIZE;
    const h = this.tank.effectiveCellHeight * TILE_SIZE;
    const text = new Text({ text: "T", style: LABEL_STYLE });
    text.anchor.set(0.5);
    text.x = w / 2;
    text.y = h / 2;
    this.container.addChild(text);
  }

  public destroy(): void {
    this.graphics.destroy();
    this.container.destroy();
  }
}
