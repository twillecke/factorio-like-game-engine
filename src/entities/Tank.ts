import { UserObject } from "./UserObject";

export class Tank extends UserObject {
  public static readonly CELL_SIZE = 2;
  public isFilled = false;
}
