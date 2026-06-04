import type { System } from "../core/types";
import type { WorldRenderer } from "../renderers/WorldRenderer";

export class InputSystem implements System {
  private readonly onPointerDown: (e: PointerEvent) => void;
  private readonly onPointerMove: (e: PointerEvent) => void;
  private readonly onPointerUp: () => void;
  private readonly onPointerLeave: () => void;
  private isDown = false;
  private lastCell: { gridX: number; gridY: number } | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    worldRenderer: WorldRenderer,
    chunkId: string,
    onCellAdd: (gridX: number, gridY: number) => void,
    onCellRemove: (gridX: number, gridY: number) => void,
    onCellHover?: (gridX: number, gridY: number) => void,
    onHoverLeave?: () => void,
  ) {
    this.onPointerDown = (e: PointerEvent) => {
      if (e.button === 2) {
        const coord = worldRenderer.screenToGrid(e.clientX, e.clientY, chunkId);
        if (coord) onCellRemove(coord.gridX, coord.gridY);
        return;
      }
      if (e.button !== 0) return;
      this.isDown = true;
      const coord = worldRenderer.screenToGrid(e.clientX, e.clientY, chunkId);
      if (!coord) return;
      this.lastCell = coord;
      onCellAdd(coord.gridX, coord.gridY);
    };

    this.onPointerMove = (e: PointerEvent) => {
      const coord = worldRenderer.screenToGrid(e.clientX, e.clientY, chunkId);
      if (coord) onCellHover?.(coord.gridX, coord.gridY);
      else onHoverLeave?.();

      if (!this.isDown) return;
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

    this.onPointerLeave = () => onHoverLeave?.();

    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerleave", this.onPointerLeave);
    window.addEventListener("pointerup", this.onPointerUp);
  }

  update(_dt: number): void {}

  destroy(): void {
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerleave", this.onPointerLeave);
    window.removeEventListener("pointerup", this.onPointerUp);
  }
}
