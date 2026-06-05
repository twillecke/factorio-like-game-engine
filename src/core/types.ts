export interface Entity {
  readonly id: string;
}

export interface SpatialEntity extends Entity {
  readonly gridX: number;
  readonly gridY: number;
  readonly effectiveCellWidth: number;
  readonly effectiveCellHeight: number;
}


export interface System {
  update(dt: number): void;
  destroy?(): void;
}
