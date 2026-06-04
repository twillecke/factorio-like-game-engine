import { Container } from "pixi.js";
import { engine } from "../core/Engine";
import { world } from "../core/World";
import type { AssetType } from "../entities/assetTypes";
import { CHUNK_SIZE, type Chunk } from "../entities/Chunk";
import { GridEntity } from "../entities/GridEntity";
import { Pipe } from "../entities/Pipe";
import { Pump } from "../entities/Pump";
import { SteamEngine } from "../entities/SteamEngine";
import { Tank } from "../entities/Tank";
import { CHUNK_PX, ChunkRenderer, TILE_SIZE } from "./ChunkRenderer";
import type { IEntityRenderer } from "./IEntityRenderer";
import { PipeRenderer } from "./PipeRenderer";
import { PreviewRenderer } from "./PreviewRenderer";
import { PumpRenderer } from "./PumpRenderer";
import { SteamEngineRenderer } from "./SteamEngineRenderer";
import { TankRenderer } from "./TankRenderer";

const RENDERER_FACTORY: Record<AssetType, (e: GridEntity) => IEntityRenderer> = {
  pipe: (e) => new PipeRenderer(e as Pipe),
  pump: (e) => new PumpRenderer(e as Pump),
  tank: (e) => new TankRenderer(e as Tank),
  steamEngine: (e) => new SteamEngineRenderer(e as SteamEngine),
};

export class WorldRenderer {
  private chunkRenderers = new Map<string, ChunkRenderer>();
  private entityRenderers = new Map<string, { r: IEntityRenderer; chunkId: string }>();
  public readonly preview = new PreviewRenderer();
  private root: Container;
  private readonly onResize: () => void;
  private static readonly MIN_ZOOM = 0.25;
  private static readonly MAX_ZOOM = 4;

  constructor() {
    this.root = new Container();
    engine.stage.addChild(this.root);
    this.onResize = () => this.layout();
    engine.renderer.on("resize", this.onResize);
  }

  public addChunk(chunk: Chunk): void {
    const r = new ChunkRenderer(chunk);
    this.chunkRenderers.set(chunk.id, r);
    this.root.addChild(r.container);
    this.preview.attach(r.container);
    this.layout();
  }

  public removeChunk(id: string): void {
    const r = this.chunkRenderers.get(id);
    if (!r) return;
    this.root.removeChild(r.container);
    r.destroy();
    this.chunkRenderers.delete(id);
  }

  public screenToGrid(screenX: number, screenY: number, chunkId: string): { gridX: number; gridY: number } | null {
    const r = this.chunkRenderers.get(chunkId);
    if (!r) return null;
    const local = r.container.toLocal({ x: screenX, y: screenY });
    const gridX = Math.floor(local.x / TILE_SIZE);
    const gridY = Math.floor(local.y / TILE_SIZE);
    if (gridX < 0 || gridX >= CHUNK_SIZE || gridY < 0 || gridY >= CHUNK_SIZE) return null;
    return { gridX, gridY };
  }

  public zoomAtPoint(screenX: number, screenY: number, factor: number): void {
    const oldScale = this.root.scale.x;
    const newScale = Math.max(WorldRenderer.MIN_ZOOM, Math.min(WorldRenderer.MAX_ZOOM, oldScale * factor));
    if (newScale === oldScale) return;
    this.root.x = screenX - (screenX - this.root.x) * (newScale / oldScale);
    this.root.y = screenY - (screenY - this.root.y) * (newScale / oldScale);
    this.root.scale.set(newScale);
  }

  public pan(dx: number, dy: number): void {
    this.root.x += dx;
    this.root.y += dy;
  }

  public render(): void {
    this.syncEntities();
    for (const { r } of this.entityRenderers.values()) r.sync?.();
    for (const r of this.chunkRenderers.values()) r.render();
  }

  private syncEntities(): void {
    const entities = world.getAll((e): e is GridEntity => e instanceof GridEntity);
    const ids = new Set(entities.map((e) => e.id));
    for (const id of [...this.entityRenderers.keys()])
      if (!ids.has(id)) this.removeEntity(id);
    for (const e of entities)
      if (!this.entityRenderers.has(e.id)) this.addEntity(e);
  }

  private addEntity(obj: GridEntity): void {
    const chunk = this.chunkRenderers.get(obj.chunkId);
    if (!chunk) throw new Error(`Chunk "${obj.chunkId}" not found`);
    const r = RENDERER_FACTORY[obj.assetType](obj);
    chunk.container.addChild(r.container);
    this.entityRenderers.set(obj.id, { r, chunkId: obj.chunkId });
  }

  private removeEntity(id: string): void {
    const entry = this.entityRenderers.get(id);
    if (!entry) return;
    const chunk = this.chunkRenderers.get(entry.chunkId);
    chunk?.container.removeChild(entry.r.container);
    entry.r.destroy();
    this.entityRenderers.delete(id);
  }

  private layout(): void {
    for (const r of this.chunkRenderers.values()) {
      r.container.x = 0;
      r.container.y = 0;
    }
    const { width, height } = engine.screen;
    this.root.x = (width - CHUNK_PX) / 2;
    this.root.y = (height - CHUNK_PX) / 2;
  }

  public destroy(): void {
    engine.renderer.off("resize", this.onResize);
    for (const { r } of this.entityRenderers.values()) r.destroy();
    this.entityRenderers.clear();
    for (const r of this.chunkRenderers.values()) r.destroy();
    this.chunkRenderers.clear();
    this.preview.destroy();
    this.root.destroy();
  }
}
