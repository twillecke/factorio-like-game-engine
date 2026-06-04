import { UserObject } from "./UserObject";

export class SteamEngine extends UserObject {
  public static readonly CELL_WIDTH = 2;
  public static readonly CELL_HEIGHT = 6;
  public isRunning = false;

  public override get cellWidth(): number { return SteamEngine.CELL_WIDTH; }
  public override get cellHeight(): number { return SteamEngine.CELL_HEIGHT; }
}
