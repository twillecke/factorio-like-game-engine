import type { Entity } from "../core/types";

export type ItemType = "coal";

let nextId = 0;

export class BeltItem implements Entity {
  public x = 0;
  public y = 0;
  public progress = 0;

  constructor(
    public readonly id: string,
    public readonly itemType: ItemType,
    public currentBeltId: string,
  ) {}

  static create(itemType: ItemType, beltId: string): BeltItem {
    return new BeltItem(`item-${nextId++}`, itemType, beltId);
  }
}
