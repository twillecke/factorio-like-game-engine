import type { Entity } from "../core/types";

export class GridEntity implements Entity {
  public static readonly CELL_SIZE: number = 1;
  public static readonly CELL_WIDTH?: number;
  public static readonly CELL_HEIGHT?: number;

  constructor(
    public readonly id: string,
    public readonly gridX: number,
    public readonly gridY: number,
    public readonly chunkId: string,
  ) {}

  public get cellSize(): number {
    return (this.constructor as typeof GridEntity).CELL_SIZE;
  }

  public get cellWidth(): number {
    return (this.constructor as typeof GridEntity).CELL_WIDTH ?? this.cellSize;
  }

  public get cellHeight(): number {
    return (this.constructor as typeof GridEntity).CELL_HEIGHT ?? this.cellSize;
  }
}
