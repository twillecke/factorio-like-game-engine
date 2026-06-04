import { GridEntity } from "./GridEntity";

export class Tank extends GridEntity {
  public static readonly CELL_SIZE = 2;
  public isFilled = false;

  constructor(id: string, gridX: number, gridY: number, chunkId: string, rotation: 0 | 90 | 180 | 270 = 0) {
    super(id, gridX, gridY, chunkId, "tank", rotation);
  }
}
