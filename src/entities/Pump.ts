import { GridEntity } from "./GridEntity";

export class Pump extends GridEntity {
  public static readonly CELL_SIZE = 2;

  constructor(id: string, gridX: number, gridY: number, chunkId: string, rotation: 0 | 90 | 180 | 270 = 0) {
    super(id, gridX, gridY, chunkId, "pump", rotation);
  }
}
