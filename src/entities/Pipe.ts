import { GridEntity } from "./GridEntity";

export class Pipe extends GridEntity {
  public isConnected = false;

  constructor(id: string, gridX: number, gridY: number, chunkId: string, rotation: 0 | 90 | 180 | 270 = 0) {
    super(id, gridX, gridY, chunkId, "pipe", rotation);
  }
}
