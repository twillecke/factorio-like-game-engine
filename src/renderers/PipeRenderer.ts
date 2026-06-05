import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { Asset } from "../entities/Asset";
import { Pipe } from "../entities/Pipe";
import { TILE_SIZE } from "./ChunkRenderer";
import type { IEntityRenderer } from "./IEntityRenderer";

const PX = Asset.CELL_SIZE * TILE_SIZE;
const COLOR_CONNECTED = 0x3498db;
const COLOR_DISCONNECTED = 0xf1c40f;

const LABEL_STYLE = new TextStyle({
  fill: 0xffffff,
  fontSize: 10,
  fontWeight: "bold",
  dropShadow: { color: 0x000000, blur: 3, distance: 0, alpha: 0.5 },
});

export class PipeRenderer implements IEntityRenderer {
  public readonly container: Container;
  private graphics: Graphics;
  private lastConnected: boolean;

  constructor(private readonly pipe: Pipe) {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    this.container.x = pipe.gridX * TILE_SIZE;
    this.container.y = pipe.gridY * TILE_SIZE;
    this.lastConnected = pipe.isConnected;
    this.draw();
    const label = new Text({ text: "P", style: LABEL_STYLE });
    label.anchor.set(0.5);
    label.x = PX / 2;
    label.y = PX / 2;
    this.container.addChild(label);
  }

  public sync(): void {
    if (this.pipe.isConnected !== this.lastConnected) {
      this.lastConnected = this.pipe.isConnected;
      this.graphics.clear();
      this.draw();
    }
  }

  private draw(): void {
    const color = this.pipe.isConnected ? COLOR_CONNECTED : COLOR_DISCONNECTED;
    const g = this.graphics;
    g.rect(0, 0, PX, PX).fill({ color, alpha: 0.9 });
    g.rect(0, 0, PX, PX).stroke({ width: 1, color: 0xffffff, alpha: 0.4 });
  }

  public destroy(): void {
    this.graphics.destroy();
    this.container.destroy();
  }
}
