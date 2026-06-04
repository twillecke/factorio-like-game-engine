import type { System } from "../core/types";
import { world } from "../core/World";
import { UserObject } from "../entities/UserObject";
import type { WorldRenderer } from "../renderers/WorldRenderer";

export class InputSystem implements System {
  private userObjectIds = new Set<string>();
  private readonly handleClick: (e: MouseEvent) => void;

  constructor(
    private canvas: HTMLCanvasElement,
    private worldRenderer: WorldRenderer,
    private chunkId: string,
  ) {
    this.handleClick = (e: MouseEvent) => {
      const coord = this.worldRenderer.screenToGrid(e.clientX, e.clientY, this.chunkId);
      if (!coord) return;
      const id = `user-${coord.gridX}-${coord.gridY}`;
      if (this.userObjectIds.has(id)) {
        world.unregister(id);
        this.worldRenderer.removeUserObject(id);
        this.userObjectIds.delete(id);
        return;
      }
      const obj = new UserObject(id, coord.gridX, coord.gridY);
      world.register(obj);
      this.worldRenderer.addUserObject(obj, this.chunkId);
      this.userObjectIds.add(id);
    };
    canvas.addEventListener("click", this.handleClick);
  }

  update(_dt: number): void {}

  destroy(): void {
    this.canvas.removeEventListener("click", this.handleClick);
    for (const id of this.userObjectIds) world.unregister(id);
    this.userObjectIds.clear();
  }
}
