import { Container, Graphics } from "pixi.js";
import type { ToolType } from "../core/toolTypes";
import { TILE_SIZE } from "./ChunkRenderer";

const TOOL_COLOR: Record<ToolType, number> = {
  pipe: 0xf1c40f,
  pump: 0x27ae60,
  tank: 0xe67e22,
};

const TOOL_SIZE: Record<ToolType, number> = {
  pipe: TILE_SIZE,
  pump: TILE_SIZE * 2,
  tank: TILE_SIZE * 2,
};

const INVALID_COLOR = 0xff4444;

export class PreviewRenderer {
  private graphics = new Graphics();
  private container: Container | null = null;

  attach(container: Container): void {
    if (this.container) this.container.removeChild(this.graphics);
    this.container = container;
    container.addChild(this.graphics);
  }

  update(tool: ToolType, gridX: number, gridY: number, isValid: boolean): void {
    const size = TOOL_SIZE[tool];
    const color = isValid ? TOOL_COLOR[tool] : INVALID_COLOR;
    this.graphics.clear();
    this.graphics.rect(0, 0, size, size).fill({ color, alpha: 0.5 });
    this.graphics.x = gridX * TILE_SIZE;
    this.graphics.y = gridY * TILE_SIZE;
  }

  clear(): void {
    this.graphics.clear();
  }

  destroy(): void {
    this.graphics.destroy();
  }
}
