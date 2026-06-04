import type { Entity } from "../core/types";

export class UserObject implements Entity {
  static readonly CELL_SIZE = 1;
  readonly color = 0xf1c40f;

  constructor(
    readonly id: string,
    readonly gridX: number,
    readonly gridY: number,
    readonly chunkId: string,
  ) {}
}
