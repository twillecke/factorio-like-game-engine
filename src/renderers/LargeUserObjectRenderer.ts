import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { Pump } from "../entities/Pump";
import { Tank } from "../entities/Tank";
import { UserObject } from "../entities/UserObject";
import { TILE_SIZE } from "./ChunkRenderer";

const PX = Pump.CELL_SIZE * TILE_SIZE;

const COLORS: Record<string, number> = {
  pump: 0x27ae60,
  tank: 0xe67e22,
};

const LABELS: Record<string, string> = {
  pump: "P",
  tank: "T",
};

const LABEL_STYLE = new TextStyle({
  fill: 0xffffff,
  fontSize: 18,
  fontWeight: "bold",
  dropShadow: { color: 0x000000, blur: 4, distance: 0, alpha: 0.6 },
});

function typeKey(obj: UserObject): string {
  if (obj instanceof Pump) return "pump";
  if (obj instanceof Tank) return "tank";
  return "unknown";
}

export class LargeUserObjectRenderer {
  public readonly container: Container;
  private graphics: Graphics;
  private lastFilled: boolean | null = null;

  constructor(private readonly obj: UserObject) {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    this.container.x = obj.gridX * TILE_SIZE;
    this.container.y = obj.gridY * TILE_SIZE;
    this.draw();
    this.addLabel();
  }

  public sync(): void {
    if (!(this.obj instanceof Tank)) return;
    if (this.obj.isFilled === this.lastFilled) return;
    this.lastFilled = this.obj.isFilled;
    this.graphics.clear();
    this.draw();
  }

  private draw(): void {
    const k = typeKey(this.obj);
    let color = COLORS[k] ?? 0xaaaaaa;
    if (this.obj instanceof Tank && this.obj.isFilled) color = 0x2980b9;
    const g = this.graphics;
    g.rect(0, 0, PX, PX).fill({ color, alpha: 0.85 });
    g.rect(0, 0, PX, PX).stroke({ width: 2, color: 0xffffff, alpha: 0.5 });
  }

  private addLabel(): void {
    const key = typeKey(this.obj);
    const label = LABELS[key];
    if (!label) return;
    const text = new Text({ text: label, style: LABEL_STYLE });
    text.anchor.set(0.5);
    text.x = PX / 2;
    text.y = PX / 2;
    this.container.addChild(text);
  }

  public destroy(): void {
    this.graphics.destroy();
    this.container.destroy();
  }
}
