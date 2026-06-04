import { Container, Graphics } from "pixi.js";
import { CHUNK_SIZE, type Chunk } from "../entities/Chunk";

export const TILE_SIZE = 32;
export const CHUNK_PX = CHUNK_SIZE * TILE_SIZE;

export class ChunkRenderer {
  public readonly container: Container;
  private graphics: Graphics;

  constructor(private readonly chunk: Chunk) {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
  }

  public render(): void {
    if (!this.chunk.dirty) return;
    this.draw();
    this.chunk.dirty = false;
  }

  private draw(): void {
    const g = this.graphics;
    g.clear();

    for (let row = 0; row < CHUNK_SIZE; row++) {
      for (let col = 0; col < CHUNK_SIZE; col++) {
        const cell = this.chunk.getCell(col, row);
        const color = cell.value === 0 ? 0x1a1a2e : 0x16213e;
        g.rect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE).fill({ color });
      }
    }

    g.setStrokeStyle({ width: 1, color: 0x3a3a5c, alpha: 0.8 });
    for (let i = 0; i <= CHUNK_SIZE; i++) {
      g.moveTo(i * TILE_SIZE, 0).lineTo(i * TILE_SIZE, CHUNK_PX);
      g.moveTo(0, i * TILE_SIZE).lineTo(CHUNK_PX, i * TILE_SIZE);
    }
    g.stroke();

    g.rect(0, 0, CHUNK_PX, CHUNK_PX).stroke({ width: 2, color: 0x6a6aaa });
  }

  public destroy(): void {
    this.graphics.destroy();
    this.container.destroy();
  }
}
