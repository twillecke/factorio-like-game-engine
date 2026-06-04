import { Container } from "pixi.js";
import { engine } from "../core/Engine";
import { type Chunk } from "../entities/Chunk";
import { CHUNK_PX, ChunkRenderer } from "./ChunkRenderer";

export class WorldRenderer {
  private renderers = new Map<string, ChunkRenderer>();
  private root: Container;

  constructor() {
    this.root = new Container();
    engine.stage.addChild(this.root);
    engine.renderer.on("resize", () => this.layout());
  }

  addChunk(chunk: Chunk): void {
    const r = new ChunkRenderer(chunk);
    this.renderers.set(chunk.id, r);
    this.root.addChild(r.container);
    this.layout();
  }

  removeChunk(id: string): void {
    const r = this.renderers.get(id);
    if (!r) return;
    this.root.removeChild(r.container);
    r.destroy();
    this.renderers.delete(id);
  }

  render(): void {
    for (const r of this.renderers.values()) {
      r.render();
    }
  }

  private layout(): void {
    const { width, height } = engine.screen;
    for (const r of this.renderers.values()) {
      r.container.x = (width - CHUNK_PX) / 2;
      r.container.y = (height - CHUNK_PX) / 2;
    }
  }

  destroy(): void {
    for (const r of this.renderers.values()) r.destroy();
    this.renderers.clear();
    this.root.destroy();
  }
}
