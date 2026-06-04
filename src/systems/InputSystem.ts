import type { System } from "../core/types";
import type { WorldRenderer } from "../renderers/WorldRenderer";

export class InputSystem implements System {
  private readonly onPointerDown: (e: PointerEvent) => void;
  private readonly onPointerMove: (e: PointerEvent) => void;
  private readonly onPointerUp: (e: PointerEvent) => void;
  private readonly onPointerLeave: () => void;
  private readonly onWheel: (e: WheelEvent) => void;
  private readonly onKeyDown: (e: KeyboardEvent) => void;
  private isDown = false;
  private lastCell: { gridX: number; gridY: number } | null = null;
  private isPanning = false;
  private panLastX = 0;
  private panLastY = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    worldRenderer: WorldRenderer,
    chunkId: string,
    onCellAdd: (gridX: number, gridY: number) => void,
    onCellRemove: (gridX: number, gridY: number) => void,
    onCellHover?: (gridX: number, gridY: number) => void,
    onHoverLeave?: () => void,
    onRotate?: () => void,
  ) {
    this.onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      worldRenderer.zoomAtPoint(e.clientX, e.clientY, factor);
    };

    this.onPointerDown = (e: PointerEvent) => {
      if (e.button === 1) {
        e.preventDefault();
        this.isPanning = true;
        this.panLastX = e.clientX;
        this.panLastY = e.clientY;
        return;
      }
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
      if (this.isPanning) {
        worldRenderer.pan(e.clientX - this.panLastX, e.clientY - this.panLastY);
        this.panLastX = e.clientX;
        this.panLastY = e.clientY;
        return;
      }
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

    this.onPointerUp = (e: PointerEvent) => {
      if (e.button === 1) {
        this.isPanning = false;
        return;
      }
      this.isDown = false;
      this.lastCell = null;
    };

    this.onPointerLeave = () => onHoverLeave?.();

    this.onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") onRotate?.();
    };

    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerleave", this.onPointerLeave);
    canvas.addEventListener("wheel", this.onWheel, { passive: false });
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("keydown", this.onKeyDown);
  }

  public update(_dt: number): void {}

  public destroy(): void {
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerleave", this.onPointerLeave);
    this.canvas.removeEventListener("wheel", this.onWheel);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("keydown", this.onKeyDown);
  }
}
