import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { SteamEngine } from "../entities/SteamEngine";
import { TILE_SIZE } from "./ChunkRenderer";

const W = SteamEngine.CELL_WIDTH * TILE_SIZE;
const H = SteamEngine.CELL_HEIGHT * TILE_SIZE;

const LABEL_STYLE = new TextStyle({
  fill: 0xffffff,
  fontSize: 16,
  fontWeight: "bold",
  dropShadow: { color: 0x000000, blur: 4, distance: 0, alpha: 0.6 },
});

export class SteamEngineRenderer {
  public readonly container: Container;
  private graphics: Graphics;
  private lastRunning: boolean | null = null;

  constructor(private readonly engine: SteamEngine) {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    this.container.x = engine.gridX * TILE_SIZE;
    this.container.y = engine.gridY * TILE_SIZE;
    this.draw();
    this.addLabel();
  }

  public sync(): void {
    if (this.engine.isRunning === this.lastRunning) return;
    this.lastRunning = this.engine.isRunning;
    this.graphics.clear();
    this.draw();
  }

  private draw(): void {
    const color = this.engine.isRunning ? 0x27ae60 : 0x7f8c8d;
    const g = this.graphics;
    g.rect(0, 0, W, H).fill({ color, alpha: 0.85 });
    g.rect(0, 0, W, H).stroke({ width: 2, color: 0xffffff, alpha: 0.5 });
  }

  private addLabel(): void {
    const text = new Text({ text: "SE", style: LABEL_STYLE });
    text.anchor.set(0.5);
    text.x = W / 2;
    text.y = H / 2;
    this.container.addChild(text);
  }

  public destroy(): void {
    this.graphics.destroy();
    this.container.destroy();
  }
}
