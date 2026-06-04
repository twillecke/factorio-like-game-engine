import type { Graphics } from "pixi.js";

export function drawRect(g: Graphics, w: number, h: number, color: number, alpha = 0.85, strokeWidth = 2): void {
  g.rect(0, 0, w, h).fill({ color, alpha });
  g.rect(0, 0, w, h).stroke({ width: strokeWidth, color: 0xffffff, alpha: 0.5 });
}
