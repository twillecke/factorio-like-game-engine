import { Container } from "pixi.js";
import { engine } from "../core/Engine";
import { world } from "../core/World";
import { CHUNK_SIZE, type Chunk } from "../entities/Chunk";
import { Pipe } from "../entities/Pipe";
import { Pump } from "../entities/Pump";
import { SteamEngine } from "../entities/SteamEngine";
import { Tank } from "../entities/Tank";
import { GridEntity } from "../entities/GridEntity";
import { CHUNK_PX, ChunkRenderer, TILE_SIZE } from "./ChunkRenderer";
import { LargeGridEntityRenderer } from "./LargeUserObjectRenderer";
import { PipeRenderer } from "./PipeRenderer";
import { PreviewRenderer } from "./PreviewRenderer";
import { SteamEngineRenderer } from "./SteamEngineRenderer";
import { GridEntityRenderer } from "./UserObjectRenderer";

export class WorldRenderer {
  private chunkRenderers = new Map<string, ChunkRenderer>();
  private gridEntityRenderers = new Map<string, { r: GridEntityRenderer; chunkId: string }>();
  private pipeRenderers = new Map<string, { r: PipeRenderer; chunkId: string }>();
  private largeEntityRenderers = new Map<string, { r: LargeGridEntityRenderer; chunkId: string }>();
  private steamEngineRenderers = new Map<string, { r: SteamEngineRenderer; chunkId: string }>();
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

  public addGridEntity(obj: GridEntity, chunkId: string): void {
    this.removeGridEntity(obj.id);
    const chunk = this.chunkRenderers.get(chunkId);
    if (!chunk) throw new Error(`Chunk "${chunkId}" not found`);
    const r = new GridEntityRenderer(obj);
    chunk.container.addChild(r.container);
    this.gridEntityRenderers.set(obj.id, { r, chunkId });
  }

  public removeGridEntity(id: string): void {
    const entry = this.gridEntityRenderers.get(id);
    if (!entry) return;
    const chunk = this.chunkRenderers.get(entry.chunkId);
    chunk?.container.removeChild(entry.r.container);
    entry.r.destroy();
    this.gridEntityRenderers.delete(id);
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

  public addPipe(pipe: Pipe, chunkId: string): void {
    this.removePipe(pipe.id);
    const chunk = this.chunkRenderers.get(chunkId);
    if (!chunk) throw new Error(`Chunk "${chunkId}" not found`);
    const r = new PipeRenderer(pipe);
    chunk.container.addChild(r.container);
    this.pipeRenderers.set(pipe.id, { r, chunkId });
  }

  public removePipe(id: string): void {
    const entry = this.pipeRenderers.get(id);
    if (!entry) return;
    const chunk = this.chunkRenderers.get(entry.chunkId);
    chunk?.container.removeChild(entry.r.container);
    entry.r.destroy();
    this.pipeRenderers.delete(id);
  }

  public addLargeEntity(obj: GridEntity, chunkId: string): void {
    this.removeLargeEntity(obj.id);
    const chunk = this.chunkRenderers.get(chunkId);
    if (!chunk) throw new Error(`Chunk "${chunkId}" not found`);
    const r = new LargeGridEntityRenderer(obj);
    chunk.container.addChild(r.container);
    this.largeEntityRenderers.set(obj.id, { r, chunkId });
  }

  public removeLargeEntity(id: string): void {
    const entry = this.largeEntityRenderers.get(id);
    if (!entry) return;
    const chunk = this.chunkRenderers.get(entry.chunkId);
    chunk?.container.removeChild(entry.r.container);
    entry.r.destroy();
    this.largeEntityRenderers.delete(id);
  }

  public addSteamEngine(obj: SteamEngine, chunkId: string): void {
    this.removeSteamEngine(obj.id);
    const chunk = this.chunkRenderers.get(chunkId);
    if (!chunk) throw new Error(`Chunk "${chunkId}" not found`);
    const r = new SteamEngineRenderer(obj);
    chunk.container.addChild(r.container);
    this.steamEngineRenderers.set(obj.id, { r, chunkId });
  }

  public removeSteamEngine(id: string): void {
    const entry = this.steamEngineRenderers.get(id);
    if (!entry) return;
    const chunk = this.chunkRenderers.get(entry.chunkId);
    chunk?.container.removeChild(entry.r.container);
    entry.r.destroy();
    this.steamEngineRenderers.delete(id);
  }

  public render(): void {
    this.syncGridEntities();
    this.syncPipes();
    this.syncLargeEntities();
    this.syncSteamEngines();
    for (const { r } of this.pipeRenderers.values()) r.sync();
    for (const { r } of this.largeEntityRenderers.values()) r.sync();
    for (const { r } of this.steamEngineRenderers.values()) r.sync();
    for (const r of this.chunkRenderers.values()) r.render();
  }

  private syncGridEntities(): void {
    const worldObjs = world.getAll(this.isGridEntity);
    const worldIds = new Set(worldObjs.map((o) => o.id));

    for (const id of [...this.gridEntityRenderers.keys()]) {
      if (!worldIds.has(id)) this.removeGridEntity(id);
    }
    for (const obj of worldObjs) {
      if (!this.gridEntityRenderers.has(obj.id)) this.addGridEntity(obj, obj.chunkId);
    }
  }

  private syncPipes(): void {
    const worldPipes = world.getAll(this.isPipe);
    const worldIds = new Set(worldPipes.map((p) => p.id));

    for (const id of [...this.pipeRenderers.keys()]) {
      if (!worldIds.has(id)) this.removePipe(id);
    }
    for (const pipe of worldPipes) {
      if (!this.pipeRenderers.has(pipe.id)) this.addPipe(pipe, pipe.chunkId);
    }
  }

  private syncLargeEntities(): void {
    const worldObjs = world.getAll(this.isLargeEntity);
    const worldIds = new Set(worldObjs.map((o) => o.id));

    for (const id of [...this.largeEntityRenderers.keys()]) {
      if (!worldIds.has(id)) this.removeLargeEntity(id);
    }
    for (const obj of worldObjs) {
      if (!this.largeEntityRenderers.has(obj.id)) this.addLargeEntity(obj, obj.chunkId);
    }
  }

  private syncSteamEngines(): void {
    const worldObjs = world.getAll(this.isSteamEngine);
    const worldIds = new Set(worldObjs.map((o) => o.id));

    for (const id of [...this.steamEngineRenderers.keys()]) {
      if (!worldIds.has(id)) this.removeSteamEngine(id);
    }
    for (const obj of worldObjs) {
      if (!this.steamEngineRenderers.has(obj.id)) this.addSteamEngine(obj, obj.chunkId);
    }
  }

  public isGridEntity(e: object): e is GridEntity {
    return e instanceof GridEntity && !(e instanceof Pipe) && !(e instanceof Pump) && !(e instanceof Tank) && !(e instanceof SteamEngine);
  }

  public isPipe(e: object): e is Pipe {
    return e instanceof Pipe;
  }

  public isLargeEntity(e: object): e is GridEntity {
    return e instanceof Pump || e instanceof Tank;
  }

  public isSteamEngine(e: object): e is SteamEngine {
    return e instanceof SteamEngine;
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
    for (const { r } of this.gridEntityRenderers.values()) r.destroy();
    this.gridEntityRenderers.clear();
    for (const { r } of this.pipeRenderers.values()) r.destroy();
    this.pipeRenderers.clear();
    for (const { r } of this.largeEntityRenderers.values()) r.destroy();
    this.largeEntityRenderers.clear();
    for (const { r } of this.steamEngineRenderers.values()) r.destroy();
    this.steamEngineRenderers.clear();
    for (const r of this.chunkRenderers.values()) r.destroy();
    this.chunkRenderers.clear();
    this.preview.destroy();
    this.root.destroy();
  }
}
