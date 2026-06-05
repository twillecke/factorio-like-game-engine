import { Container } from "pixi.js";
import { engine } from "../core/Engine";
import { CHUNK_PX } from "./ChunkRenderer";

export class Camera {
  public readonly root: Container;
  private static readonly MIN_ZOOM = 0.25;
  private static readonly MAX_ZOOM = 4;
  private readonly onResize: () => void;

  constructor() {
    this.root = new Container();
    engine.stage.addChild(this.root);
    this.onResize = () => this.layout();
    engine.renderer.on("resize", this.onResize);
    this.layout();
  }

  public pan(dx: number, dy: number): void {
    this.root.x += dx;
    this.root.y += dy;
  }

  public zoomAtPoint(screenX: number, screenY: number, factor: number): void {
    const oldScale = this.root.scale.x;
    const newScale = Math.max(Camera.MIN_ZOOM, Math.min(Camera.MAX_ZOOM, oldScale * factor));
    if (newScale === oldScale) return;
    this.root.x = screenX - (screenX - this.root.x) * (newScale / oldScale);
    this.root.y = screenY - (screenY - this.root.y) * (newScale / oldScale);
    this.root.scale.set(newScale);
  }

  public layout(): void {
    const { width, height } = engine.screen;
    this.root.x = (width - CHUNK_PX) / 2;
    this.root.y = (height - CHUNK_PX) / 2;
  }

  public destroy(): void {
    engine.renderer.off("resize", this.onResize);
    this.root.destroy();
  }
}
