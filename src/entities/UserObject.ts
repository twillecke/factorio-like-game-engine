import type { Entity } from "../core/types";

export class UserObject implements Entity {
  static readonly CELL_SIZE = 1;

  constructor(
    readonly id: string,
    readonly gridX: number,
    readonly gridY: number,
    readonly chunkId: string,
  ) {}

  get cellSize(): number {
    return (this.constructor as typeof UserObject).CELL_SIZE;
  }
}
