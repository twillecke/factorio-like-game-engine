import { Container } from "pixi.js";
import { engine } from "../core/Engine";
import { type Chunk } from "../entities/Chunk";
import { type Marker } from "../entities/Marker";
import { CHUNK_PX, ChunkRenderer } from "./ChunkRenderer";
import { MarkerRenderer } from "./MarkerRenderer";

export class WorldRenderer {
  private chunkRenderers = new Map<string, ChunkRenderer>();
  private markerRenderers = new Map<string, { r: MarkerRenderer; chunkId: string }>();
  private root: Container;

  constructor() {
    this.root = new Container();
    engine.stage.addChild(this.root);
    engine.renderer.on("resize", () => this.layout());
  }

  addChunk(chunk: Chunk): void {
    const r = new ChunkRenderer(chunk);
    this.chunkRenderers.set(chunk.id, r);
    this.root.addChild(r.container);
    this.layout();
  }

  removeChunk(id: string): void {
    const r = this.chunkRenderers.get(id);
    if (!r) return;
    this.root.removeChild(r.container);
    r.destroy();
    this.chunkRenderers.delete(id);
  }

  addMarker(marker: Marker, chunkId: string): void {
    const chunk = this.chunkRenderers.get(chunkId);
    if (!chunk) throw new Error(`Chunk "${chunkId}" not found`);
    const r = new MarkerRenderer(marker);
    chunk.container.addChild(r.container);
    this.markerRenderers.set(marker.id, { r, chunkId });
  }

  removeMarker(id: string): void {
    const entry = this.markerRenderers.get(id);
    if (!entry) return;
    const chunk = this.chunkRenderers.get(entry.chunkId);
    chunk?.container.removeChild(entry.r.container);
    entry.r.destroy();
    this.markerRenderers.delete(id);
  }

  render(): void {
    for (const r of this.chunkRenderers.values()) {
      r.render();
    }
  }

  private layout(): void {
    const { width, height } = engine.screen;
    for (const r of this.chunkRenderers.values()) {
      r.container.x = (width - CHUNK_PX) / 2;
      r.container.y = (height - CHUNK_PX) / 2;
    }
  }

  destroy(): void {
    for (const { r } of this.markerRenderers.values()) r.destroy();
    this.markerRenderers.clear();
    for (const r of this.chunkRenderers.values()) r.destroy();
    this.chunkRenderers.clear();
    this.root.destroy();
  }
}
