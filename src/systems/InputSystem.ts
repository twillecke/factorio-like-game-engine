import type { System } from "../core/types";
import type { WorldRenderer } from "../renderers/WorldRenderer";

export class InputSystem implements System {
  private readonly onPointerDown: (e: PointerEvent) => void;
  private readonly onPointerMove: (e: PointerEvent) => void;
  private readonly onPointerUp: () => void;
  private isDown = false;
  private lastCell: { gridX: number; gridY: number } | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    worldRenderer: WorldRenderer,
    chunkId: string,
    onCellAdd: (gridX: number, gridY: number) => void,
    onCellRemove: (gridX: number, gridY: number) => void,
  ) {
    this.onPointerDown = (e: PointerEvent) => {
      if (e.button === 2) {
        const coord = worldRenderer.screenToGrid(e.clientX, e.clientY, chunkId);
        if (coord) onCellRemove(coord.gridX, coord.gridY);
        return;
      }
      this.isDown = true;
      const coord = worldRenderer.screenToGrid(e.clientX, e.clientY, chunkId);
      if (!coord) return;
      this.lastCell = coord;
      onCellAdd(coord.gridX, coord.gridY);
    };

    this.onPointerMove = (e: PointerEvent) => {
      if (!this.isDown) return;
      const coord = worldRenderer.screenToGrid(e.clientX, e.clientY, chunkId);
      if (!coord) return;
      const sameAsLast =
        this.lastCell &&
        coord.gridX === this.lastCell.gridX &&
        coord.gridY === this.lastCell.gridY;
      if (sameAsLast) return;
      this.lastCell = coord;
      onCellAdd(coord.gridX, coord.gridY);
    };

    this.onPointerUp = () => {
      this.isDown = false;
      this.lastCell = null;
    };

    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
  }

  update(_dt: number): void {}

  destroy(): void {
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
  }
}
