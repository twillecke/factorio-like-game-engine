import { Container, Graphics } from "pixi.js";
import { UserObject } from "../entities/UserObject";
import { TILE_SIZE } from "./ChunkRenderer";

const PX = UserObject.CELL_SIZE * TILE_SIZE;

export class UserObjectRenderer {
  readonly container: Container;
  private graphics: Graphics;

  constructor(private readonly obj: UserObject) {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    this.container.x = obj.gridX * TILE_SIZE;
    this.container.y = obj.gridY * TILE_SIZE;
    this.draw();
  }

  private draw(): void {
    const g = this.graphics;
    g.rect(0, 0, PX, PX).fill({ color: this.obj.color, alpha: 0.9 });
    g.rect(0, 0, PX, PX).stroke({ width: 1, color: 0xffffff, alpha: 0.4 });
  }

  destroy(): void {
    this.graphics.destroy();
    this.container.destroy();
  }
}
