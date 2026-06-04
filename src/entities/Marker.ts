import type { Entity } from "../core/types";

export class Marker implements Entity {
  static readonly CELL_SIZE = 2;

  constructor(
    readonly id: string,
    readonly gridX: number,
    readonly gridY: number,
  ) {}
}
