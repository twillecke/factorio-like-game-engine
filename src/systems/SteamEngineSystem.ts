import type { Entity, System } from "../core/types";
import { world } from "../core/World";
import { SteamEngine } from "../entities/SteamEngine";
import type { PipeSystem } from "./PipeSystem";

function isSteamEngine(e: Entity): e is SteamEngine { return e instanceof SteamEngine; }

export class SteamEngineSystem implements System {
  constructor(private readonly pipes: PipeSystem) {}

  public update(dt: number): void {
    for (const engine of world.getAll(isSteamEngine)) {
      engine.hasWater = this.pipes.isAdjacentToWater(engine.gridX, engine.gridY, SteamEngine.CELL_WIDTH, SteamEngine.CELL_HEIGHT);
      if (engine.isRunning) engine.fuelTime = Math.max(0, engine.fuelTime - dt / 60);
    }
  }
}
