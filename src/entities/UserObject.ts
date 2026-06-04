import type { Entity } from "../core/types";

export class UserObject implements Entity {
  public static readonly CELL_SIZE = 1;

  constructor(
    public readonly id: string,
    public readonly gridX: number,
    public readonly gridY: number,
    public readonly chunkId: string,
  ) {}

  public get cellSize(): number {
    return (this.constructor as typeof UserObject).CELL_SIZE;
  }
}
