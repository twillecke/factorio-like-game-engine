import { GridEntity } from "./GridEntity";

export class Tank extends GridEntity {
  public static readonly CELL_SIZE = 2;
  public isFilled = false;
}
