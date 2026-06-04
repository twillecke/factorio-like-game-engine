import { Container, Graphics } from "pixi.js";
import { UserObject } from "../entities/UserObject";
import { Pipe } from "../entities/Pipe";
import { TILE_SIZE } from "./ChunkRenderer";

const PX = UserObject.CELL_SIZE * TILE_SIZE;
const COLOR_CONNECTED = 0x3498db;
const COLOR_DISCONNECTED = 0xf1c40f;

export class PipeRenderer {
  readonly container: Container;
  private graphics: Graphics;
  private lastConnected: boolean;

  constructor(private readonly pipe: Pipe) {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    this.container.x = pipe.gridX * TILE_SIZE;
    this.container.y = pipe.gridY * TILE_SIZE;
    this.lastConnected = pipe.isConnected;
    this.draw();
  }

  sync(): void {
    if (this.pipe.isConnected !== this.lastConnected) {
      this.lastConnected = this.pipe.isConnected;
      this.graphics.clear();
      this.draw();
    }
  }

  private draw(): void {
    const color = this.pipe.isConnected ? COLOR_CONNECTED : COLOR_DISCONNECTED;
    const g = this.graphics;
    g.rect(0, 0, PX, PX).fill({ color, alpha: 0.9 });
    g.rect(0, 0, PX, PX).stroke({ width: 1, color: 0xffffff, alpha: 0.4 });
  }

  destroy(): void {
    this.graphics.destroy();
    this.container.destroy();
  }
}
