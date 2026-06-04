import type { System } from "../core/types";
import type { WorldRenderer } from "../renderers/WorldRenderer";

export class InputSystem implements System {
  private readonly onCanvasClick: (e: MouseEvent) => void;

  constructor(
    private canvas: HTMLCanvasElement,
    worldRenderer: WorldRenderer,
    chunkId: string,
    onCellClick: (gridX: number, gridY: number) => void,
  ) {
    this.onCanvasClick = (e: MouseEvent) => {
      const coord = worldRenderer.screenToGrid(e.clientX, e.clientY, chunkId);
      if (!coord) return;
      onCellClick(coord.gridX, coord.gridY);
    };
    canvas.addEventListener("click", this.onCanvasClick);
  }

  update(_dt: number): void {}

  destroy(): void {
    this.canvas.removeEventListener("click", this.onCanvasClick);
  }
}
