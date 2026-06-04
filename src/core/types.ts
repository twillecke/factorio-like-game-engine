export interface Entity {
  readonly id: string;
}

export interface System {
  update(dt: number): void;
  destroy?(): void;
}
