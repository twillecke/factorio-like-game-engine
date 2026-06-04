import { Container, Graphics } from "pixi.js";
import { Marker } from "../entities/Marker";
import { TILE_SIZE } from "./ChunkRenderer";

const PX = Marker.CELL_SIZE * TILE_SIZE;

export class MarkerRenderer {
  readonly container: Container;
  private graphics: Graphics;

  constructor(private readonly marker: Marker) {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    this.container.x = marker.gridX * TILE_SIZE;
    this.container.y = marker.gridY * TILE_SIZE;
    this.draw();
  }

  private static readonly COLORS: Record<string, number> = {
    start: 0xe74c3c,
    end: 0x3498db,
  };

  private draw(): void {
    const color = MarkerRenderer.COLORS[this.marker.id] ?? 0xffffff;
    const g = this.graphics;
    g.rect(0, 0, PX, PX).fill({ color, alpha: 0.85 });
    g.rect(0, 0, PX, PX).stroke({ width: 2, color: 0xffffff, alpha: 0.5 });
  }

  destroy(): void {
    this.graphics.destroy();
    this.container.destroy();
  }
}
