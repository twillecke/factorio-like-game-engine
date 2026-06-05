import { Asset } from "./Asset";

export class Tank extends Asset {
  public static readonly CELL_SIZE = 2;
  public isFilled = false;

  constructor(id: string, gridX: number, gridY: number, chunkId: string, rotation: 0 | 90 | 180 | 270 = 0) {
    super(id, gridX, gridY, chunkId, "tank", rotation);
  }
}
