import { GridEntity } from "./GridEntity";

export class Belt extends GridEntity {
  static readonly CELL_SIZE = 1;

  constructor(id: string, gridX: number, gridY: number, chunkId: string, rotation: 0 | 90 | 180 | 270 = 0) {
    super(id, gridX, gridY, chunkId, "belt", rotation);
  }
}
