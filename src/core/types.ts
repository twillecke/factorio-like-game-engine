export interface Entity {
  readonly id: string;
}

export interface Updatable {
  update(dt: number): void;
}
