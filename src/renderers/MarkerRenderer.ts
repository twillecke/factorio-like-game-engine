import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { Marker } from "../entities/Marker";
import { TILE_SIZE } from "./ChunkRenderer";

const PX = Marker.CELL_SIZE * TILE_SIZE;

const COLORS: Record<string, number> = {
  start: 0x3498db,
  end: 0xe74c3c,
};

const LABELS: Record<string, string> = {
  start: "Start",
  end: "End",
};

const LABEL_STYLE = new TextStyle({
  fill: 0xffffff,
  fontSize: 12,
  fontWeight: "bold",
  dropShadow: { color: 0x000000, blur: 4, distance: 0, alpha: 0.6 },
});

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
    this.addLabel();
  }

  private draw(): void {
    const color = COLORS[this.marker.id] ?? 0xffffff;
    const g = this.graphics;
    g.rect(0, 0, PX, PX).fill({ color, alpha: 0.85 });
    g.rect(0, 0, PX, PX).stroke({ width: 2, color: 0xffffff, alpha: 0.5 });
  }

  private addLabel(): void {
    const label = LABELS[this.marker.id];
    if (!label) return;
    const text = new Text({ text: label, style: LABEL_STYLE });
    text.anchor.set(0.5);
    text.x = PX / 2;
    text.y = PX / 2;
    this.container.addChild(text);
  }

  destroy(): void {
    this.graphics.destroy();
    this.container.destroy();
  }
}
