import { GridEntity } from "./GridEntity";

export class SteamEngine extends GridEntity {
  public static readonly CELL_WIDTH = 2;
  public static readonly CELL_HEIGHT = 6;
  public isRunning = false;

  constructor(id: string, gridX: number, gridY: number, chunkId: string, rotation: 0 | 90 | 180 | 270 = 0) {
    super(id, gridX, gridY, chunkId, "steamEngine", rotation);
  }

  public override get cellWidth(): number { return SteamEngine.CELL_WIDTH; }
  public override get cellHeight(): number { return SteamEngine.CELL_HEIGHT; }
}
