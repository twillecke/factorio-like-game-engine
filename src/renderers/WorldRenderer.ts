import { Container } from "pixi.js";
import { engine } from "../core/Engine";
import { world } from "../core/World";
import { CHUNK_SIZE, type Chunk } from "../entities/Chunk";
import { type Marker } from "../entities/Marker";
import { Pipe } from "../entities/Pipe";
import { Pump } from "../entities/Pump";
import { Tank } from "../entities/Tank";
import { UserObject } from "../entities/UserObject";
import { CHUNK_PX, ChunkRenderer, TILE_SIZE } from "./ChunkRenderer";
import { LargeUserObjectRenderer } from "./LargeUserObjectRenderer";
import { MarkerRenderer } from "./MarkerRenderer";
import { PipeRenderer } from "./PipeRenderer";
import { UserObjectRenderer } from "./UserObjectRenderer";

export class WorldRenderer {
  private chunkRenderers = new Map<string, ChunkRenderer>();
  private markerRenderers = new Map<string, { r: MarkerRenderer; chunkId: string }>();
  private userObjectRenderers = new Map<string, { r: UserObjectRenderer; chunkId: string }>();
  private pipeRenderers = new Map<string, { r: PipeRenderer; chunkId: string }>();
  private largeObjectRenderers = new Map<string, { r: LargeUserObjectRenderer; chunkId: string }>();
  private root: Container;
  private readonly onResize: () => void;

  constructor() {
    this.root = new Container();
    engine.stage.addChild(this.root);
    this.onResize = () => this.layout();
    engine.renderer.on("resize", this.onResize);
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

  addUserObject(obj: UserObject, chunkId: string): void {
    this.removeUserObject(obj.id);
    const chunk = this.chunkRenderers.get(chunkId);
    if (!chunk) throw new Error(`Chunk "${chunkId}" not found`);
    const r = new UserObjectRenderer(obj);
    chunk.container.addChild(r.container);
    this.userObjectRenderers.set(obj.id, { r, chunkId });
  }

  removeUserObject(id: string): void {
    const entry = this.userObjectRenderers.get(id);
    if (!entry) return;
    const chunk = this.chunkRenderers.get(entry.chunkId);
    chunk?.container.removeChild(entry.r.container);
    entry.r.destroy();
    this.userObjectRenderers.delete(id);
  }

  screenToGrid(screenX: number, screenY: number, chunkId: string): { gridX: number; gridY: number } | null {
    const r = this.chunkRenderers.get(chunkId);
    if (!r) return null;
    const relX = screenX - r.container.x;
    const relY = screenY - r.container.y;
    const gridX = Math.floor(relX / TILE_SIZE);
    const gridY = Math.floor(relY / TILE_SIZE);
    if (gridX < 0 || gridX >= CHUNK_SIZE || gridY < 0 || gridY >= CHUNK_SIZE) return null;
    return { gridX, gridY };
  }

  addPipe(pipe: Pipe, chunkId: string): void {
    this.removePipe(pipe.id);
    const chunk = this.chunkRenderers.get(chunkId);
    if (!chunk) throw new Error(`Chunk "${chunkId}" not found`);
    const r = new PipeRenderer(pipe);
    chunk.container.addChild(r.container);
    this.pipeRenderers.set(pipe.id, { r, chunkId });
  }

  removePipe(id: string): void {
    const entry = this.pipeRenderers.get(id);
    if (!entry) return;
    const chunk = this.chunkRenderers.get(entry.chunkId);
    chunk?.container.removeChild(entry.r.container);
    entry.r.destroy();
    this.pipeRenderers.delete(id);
  }

  addLargeObject(obj: UserObject, chunkId: string): void {
    this.removeLargeObject(obj.id);
    const chunk = this.chunkRenderers.get(chunkId);
    if (!chunk) throw new Error(`Chunk "${chunkId}" not found`);
    const r = new LargeUserObjectRenderer(obj);
    chunk.container.addChild(r.container);
    this.largeObjectRenderers.set(obj.id, { r, chunkId });
  }

  removeLargeObject(id: string): void {
    const entry = this.largeObjectRenderers.get(id);
    if (!entry) return;
    const chunk = this.chunkRenderers.get(entry.chunkId);
    chunk?.container.removeChild(entry.r.container);
    entry.r.destroy();
    this.largeObjectRenderers.delete(id);
  }

  render(): void {
    this.syncUserObjects();
    this.syncPipes();
    this.syncLargeObjects();
    for (const { r } of this.pipeRenderers.values()) r.sync();
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

  isUserObject(e: object): e is UserObject {
    return e instanceof UserObject && !(e instanceof Pipe) && !(e instanceof Pump) && !(e instanceof Tank);
  }

  isPipe(e: object): e is Pipe {
    return e instanceof Pipe;
  }

  isLargeObject(e: object): e is UserObject {
    return e instanceof Pump || e instanceof Tank;
  }

  private layout(): void {
    const { width, height } = engine.screen;
    for (const r of this.chunkRenderers.values()) {
      r.container.x = (width - CHUNK_PX) / 2;
      r.container.y = (height - CHUNK_PX) / 2;
    }
  }

  destroy(): void {
    engine.renderer.off("resize", this.onResize);
    for (const { r } of this.userObjectRenderers.values()) r.destroy();
    this.userObjectRenderers.clear();
    for (const { r } of this.pipeRenderers.values()) r.destroy();
    this.pipeRenderers.clear();
    for (const { r } of this.largeObjectRenderers.values()) r.destroy();
    this.largeObjectRenderers.clear();
    for (const { r } of this.markerRenderers.values()) r.destroy();
    this.markerRenderers.clear();
    for (const r of this.chunkRenderers.values()) r.destroy();
    this.chunkRenderers.clear();
    this.root.destroy();
  }
}
