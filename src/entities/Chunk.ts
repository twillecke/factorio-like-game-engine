import type { Entity, Updatable } from "../core/types";

export const CHUNK_SIZE = 16;

export interface Cell {
  value: number;
}

export class Chunk implements Entity, Updatable {
  readonly id: string;
  readonly cells: Cell[][];
  dirty = true;

  constructor(id: string) {
    this.id = id;
    this.cells = Array.from({ length: CHUNK_SIZE }, () =>
      Array.from({ length: CHUNK_SIZE }, () => ({ value: 0 })),
    );
  }

  getCell(x: number, y: number): Cell {
    return this.cells[y][x];
  }

  setCell(x: number, y: number, value: number): void {
    this.cells[y][x].value = value;
    this.dirty = true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_dt: number): void {}
}
