import { Asset } from "./Asset";

export class Pipe extends Asset {
  public isConnected = false;

  constructor(id: string, gridX: number, gridY: number, chunkId: string, rotation: 0 | 90 | 180 | 270 = 0) {
    super(id, gridX, gridY, chunkId, "pipe", rotation);
  }
}
