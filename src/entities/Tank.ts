import { UserObject } from "./UserObject";

export class Tank extends UserObject {
  static readonly CELL_SIZE = 2;
  isFilled = false;
}
