import type { Container } from "pixi.js";

export interface IEntityRenderer {
  readonly container: Container;
  sync?(): void;
  destroy(): void;
}
