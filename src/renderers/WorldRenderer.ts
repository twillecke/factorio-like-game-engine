import { Container } from "pixi.js";
import { engine } from "../core/Engine";
import { world } from "../core/World";
import { CHUNK_SIZE, type Chunk } from "../entities/Chunk";
import { Pipe } from "../entities/Pipe";
import { Pump } from "../entities/Pump";
import { Tank } from "../entities/Tank";
import { UserObject } from "../entities/UserObject";
import { CHUNK_PX, ChunkRenderer, TILE_SIZE } from "./ChunkRenderer";
import { LargeUserObjectRenderer } from "./LargeUserObjectRenderer";
import { PipeRenderer } from "./PipeRenderer";
import { PreviewRenderer } from "./PreviewRenderer";
import { UserObjectRenderer } from "./UserObjectRenderer";

export class WorldRenderer {
  private chunkRenderers = new Map<string, ChunkRenderer>();
  private userObjectRenderers = new Map<string, { r: UserObjectRenderer; chunkId: string }>();
  private pipeRenderers = new Map<string, { r: PipeRenderer; chunkId: string }>();
  private largeObjectRenderers = new Map<string, { r: LargeUserObjectRenderer; chunkId: string }>();
  public readonly preview = new PreviewRenderer();
  private root: Container;
  private readonly onResize: () => void;

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

  public addUserObject(obj: UserObject, chunkId: string): void {
    this.removeUserObject(obj.id);
    const chunk = this.chunkRenderers.get(chunkId);
    if (!chunk) throw new Error(`Chunk "${chunkId}" not found`);
    const r = new UserObjectRenderer(obj);
    chunk.container.addChild(r.container);
    this.userObjectRenderers.set(obj.id, { r, chunkId });
  }

  public removeUserObject(id: string): void {
    const entry = this.userObjectRenderers.get(id);
    if (!entry) return;
    const chunk = this.chunkRenderers.get(entry.chunkId);
    chunk?.container.removeChild(entry.r.container);
    entry.r.destroy();
    this.userObjectRenderers.delete(id);
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

  private static readonly MIN_ZOOM = 0.25;
  private static readonly MAX_ZOOM = 4;

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

  public addLargeObject(obj: UserObject, chunkId: string): void {
    this.removeLargeObject(obj.id);
    const chunk = this.chunkRenderers.get(chunkId);
    if (!chunk) throw new Error(`Chunk "${chunkId}" not found`);
    const r = new LargeUserObjectRenderer(obj);
    chunk.container.addChild(r.container);
    this.largeObjectRenderers.set(obj.id, { r, chunkId });
  }

  public removeLargeObject(id: string): void {
    const entry = this.largeObjectRenderers.get(id);
    if (!entry) return;
    const chunk = this.chunkRenderers.get(entry.chunkId);
    chunk?.container.removeChild(entry.r.container);
    entry.r.destroy();
    this.largeObjectRenderers.delete(id);
  }

  public render(): void {
    this.syncUserObjects();
    this.syncPipes();
    this.syncLargeObjects();
    for (const { r } of this.pipeRenderers.values()) r.sync();
    for (const { r } of this.largeObjectRenderers.values()) r.sync();
    for (const r of this.chunkRenderers.values()) r.render();
  }

  private syncUserObjects(): void {
    const worldObjs = world.getAll(this.isUserObject);
    const worldIds = new Set(worldObjs.map((o) => o.id));

    for (const id of [...this.userObjectRenderers.keys()]) {
      if (!worldIds.has(id)) this.removeUserObject(id);
    }
    for (const obj of worldObjs) {
      if (!this.userObjectRenderers.has(obj.id)) this.addUserObject(obj, obj.chunkId);
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

  private syncLargeObjects(): void {
    const worldObjs = world.getAll(this.isLargeObject);
    const worldIds = new Set(worldObjs.map((o) => o.id));

    for (const id of [...this.largeObjectRenderers.keys()]) {
      if (!worldIds.has(id)) this.removeLargeObject(id);
    }
    for (const obj of worldObjs) {
      if (!this.largeObjectRenderers.has(obj.id)) this.addLargeObject(obj, obj.chunkId);
    }
  }

  public isUserObject(e: object): e is UserObject {
    return e instanceof UserObject && !(e instanceof Pipe) && !(e instanceof Pump) && !(e instanceof Tank);
  }

  public isPipe(e: object): e is Pipe {
    return e instanceof Pipe;
  }

  public isLargeObject(e: object): e is UserObject {
    return e instanceof Pump || e instanceof Tank;
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
    for (const { r } of this.userObjectRenderers.values()) r.destroy();
    this.userObjectRenderers.clear();
    for (const { r } of this.pipeRenderers.values()) r.destroy();
    this.pipeRenderers.clear();
    for (const { r } of this.largeObjectRenderers.values()) r.destroy();
    this.largeObjectRenderers.clear();
    for (const r of this.chunkRenderers.values()) r.destroy();
    this.chunkRenderers.clear();
    this.preview.destroy();
    this.root.destroy();
  }
}
