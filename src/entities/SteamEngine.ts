import type { BeltItem } from "./BeltItem";
import { Asset } from "./Asset";
import type { IItemReceiver } from "./IItemReceiver";

export class SteamEngine extends Asset implements IItemReceiver {
  public static readonly CELL_WIDTH = 2;
  public static readonly CELL_HEIGHT = 6;
  public static readonly COAL_BURN_DURATION = 5; // seconds per coal
  public hasWater = false;
  public fuelTime = 0;

  get isRunning(): boolean { return this.fuelTime > 0 && this.hasWater; }
  get fuelCoal(): number { return this.fuelTime / SteamEngine.COAL_BURN_DURATION; }

  constructor(id: string, gridX: number, gridY: number, chunkId: string, rotation: 0 | 90 | 180 | 270 = 0) {
    super(id, gridX, gridY, chunkId, "steamEngine", rotation);
  }

  public acceptItem(item: BeltItem): boolean {
    if (item.itemType !== "coal") return false;
    this.fuelTime += SteamEngine.COAL_BURN_DURATION;
    return true;
  }

  public override get cellWidth(): number { return SteamEngine.CELL_WIDTH; }
  public override get cellHeight(): number { return SteamEngine.CELL_HEIGHT; }
}
