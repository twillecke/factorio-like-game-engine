import type { BeltItem } from "./BeltItem";
import { GridEntity } from "./GridEntity";
import type { IItemReceiver } from "./IItemReceiver";

const COAL_BURN_DURATION = 5; // seconds per coal

export class SteamEngine extends GridEntity implements IItemReceiver {
  public static readonly CELL_WIDTH = 2;
  public static readonly CELL_HEIGHT = 6;
  public isRunning = false;
  public fuelTime = 0;

  constructor(id: string, gridX: number, gridY: number, chunkId: string, rotation: 0 | 90 | 180 | 270 = 0) {
    super(id, gridX, gridY, chunkId, "steamEngine", rotation);
  }

  public acceptItem(item: BeltItem): boolean {
    if (item.itemType !== "coal") return false;
    this.fuelTime += COAL_BURN_DURATION;
    return true;
  }

  public override get cellWidth(): number { return SteamEngine.CELL_WIDTH; }
  public override get cellHeight(): number { return SteamEngine.CELL_HEIGHT; }
}
