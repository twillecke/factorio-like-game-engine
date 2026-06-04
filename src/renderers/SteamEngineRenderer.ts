import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { SteamEngine } from "../entities/SteamEngine";
import { TILE_SIZE } from "./ChunkRenderer";
import type { IEntityRenderer } from "./IEntityRenderer";

const LABEL_STYLE = new TextStyle({
  fill: 0xffffff,
  fontSize: 16,
  fontWeight: "bold",
  dropShadow: { color: 0x000000, blur: 4, distance: 0, alpha: 0.6 },
});

export class SteamEngineRenderer implements IEntityRenderer {
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
    if (!this.engine.isRunning) {
      if (this.lastRunning === false) return;
      this.lastRunning = false;
    } else {
      this.lastRunning = true;
    }
    this.graphics.clear();
    this.draw();
  }

  private static hslToHex(h: number, s: number, l: number): number {
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    return (Math.round(f(0) * 255) << 16) | (Math.round(f(8) * 255) << 8) | Math.round(f(4) * 255);
  }

  private draw(): void {
    const w = this.engine.effectiveCellWidth * TILE_SIZE;
    const h = this.engine.effectiveCellHeight * TILE_SIZE;
    let color: number;
    if (this.engine.isRunning) {
      const t = Date.now() / 1000;
      const bounce = (Math.sin(t * 2.5) + 1) / 2;
      color = SteamEngineRenderer.hslToHex(120 + bounce * 40, 70, 35 + bounce * 15);
    } else {
      color = 0x7f8c8d;
    }
    const g = this.graphics;
    g.rect(0, 0, w, h).fill({ color, alpha: 0.85 });
    g.rect(0, 0, w, h).stroke({ width: 2, color: 0xffffff, alpha: 0.5 });
  }

  private addLabel(): void {
    const w = this.engine.effectiveCellWidth * TILE_SIZE;
    const h = this.engine.effectiveCellHeight * TILE_SIZE;
    const text = new Text({ text: "SE", style: LABEL_STYLE });
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
