import { Container, Graphics } from "pixi.js";
import { Belt } from "../entities/Belt";
import { TILE_SIZE } from "./ChunkRenderer";
import type { IEntityRenderer } from "./IEntityRenderer";

const BELT_COLOR = 0x7B5730;
const STRIPE_COLOR = 0x000000;
const STRIPE_WIDTH = 3;
const STRIPE_SPACING = 8;
const BELT_SPEED = 32;

export class BeltRenderer implements IEntityRenderer {
  public readonly container: Container;
  private baseGraphics: Graphics;
  private stripeGraphics: Graphics;
  private stripeMask: Graphics;

  constructor(private readonly belt: Belt) {
    this.container = new Container();
    this.container.x = belt.gridX * TILE_SIZE;
    this.container.y = belt.gridY * TILE_SIZE;

    this.baseGraphics = new Graphics();
    this.baseGraphics.rect(0, 0, TILE_SIZE, TILE_SIZE).fill({ color: BELT_COLOR });
    this.baseGraphics.rect(0, 0, TILE_SIZE, TILE_SIZE).stroke({ width: 1, color: 0xffffff, alpha: 0.35 });

    this.stripeMask = new Graphics();
    this.stripeMask.rect(0, 0, TILE_SIZE, TILE_SIZE).fill(0xffffff);

    this.stripeGraphics = new Graphics();
    this.stripeGraphics.mask = this.stripeMask;

    this.container.addChild(this.baseGraphics);
    this.container.addChild(this.stripeMask);
    this.container.addChild(this.stripeGraphics);
  }

  public sync(): void {
    const g = this.stripeGraphics;
    g.clear();

    const rawOffset = (Date.now() / 1000 * BELT_SPEED) % STRIPE_SPACING;
    const isForward = this.belt.rotation === 0 || this.belt.rotation === 90;
    const offset = isForward ? rawOffset : STRIPE_SPACING - rawOffset;
    const isHorizontalMovement = this.belt.rotation === 0 || this.belt.rotation === 180;

    if (isHorizontalMovement) {
      for (let x = offset - STRIPE_SPACING; x <= TILE_SIZE + STRIPE_SPACING; x += STRIPE_SPACING) {
        g.moveTo(x, 0).lineTo(x, TILE_SIZE);
      }
    } else {
      for (let y = offset - STRIPE_SPACING; y <= TILE_SIZE + STRIPE_SPACING; y += STRIPE_SPACING) {
        g.moveTo(0, y).lineTo(TILE_SIZE, y);
      }
    }
    g.stroke({ width: STRIPE_WIDTH, color: STRIPE_COLOR, alpha: 0.55 });
  }

  public destroy(): void {
    this.baseGraphics.destroy();
    this.stripeGraphics.destroy();
    this.stripeMask.destroy();
    this.container.destroy();
  }
}
