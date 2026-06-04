import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { Pump } from "../entities/Pump";
import { TILE_SIZE } from "./ChunkRenderer";
import { drawRect } from "./drawRect";
import type { IEntityRenderer } from "./IEntityRenderer";

const LABEL_STYLE = new TextStyle({
  fill: 0xffffff,
  fontSize: 18,
  fontWeight: "bold",
  dropShadow: { color: 0x000000, blur: 4, distance: 0, alpha: 0.6 },
});

export class PumpRenderer implements IEntityRenderer {
  public readonly container: Container;
  private readonly graphics: Graphics;

  constructor(private readonly pump: Pump) {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    this.container.x = pump.gridX * TILE_SIZE;
    this.container.y = pump.gridY * TILE_SIZE;
    this.draw();
    this.addLabel();
  }

  private draw(): void {
    const w = this.pump.effectiveCellWidth * TILE_SIZE;
    const h = this.pump.effectiveCellHeight * TILE_SIZE;
    drawRect(this.graphics, w, h, 0x27ae60);
  }

  private addLabel(): void {
    const w = this.pump.effectiveCellWidth * TILE_SIZE;
    const h = this.pump.effectiveCellHeight * TILE_SIZE;
    const text = new Text({ text: "P", style: LABEL_STYLE });
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
