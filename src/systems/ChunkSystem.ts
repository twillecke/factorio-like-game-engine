import type { System } from "../core/types";
import { world } from "../core/World";
import { SteamEngine } from "../entities/SteamEngine";

function isSteamEngine(e: object): e is SteamEngine { return e instanceof SteamEngine; }

export class ChunkSystem implements System {
  public update(dt: number): void {
    for (const engine of world.getAll(isSteamEngine)) {
      if (engine.fuelTime > 0) engine.fuelTime = Math.max(0, engine.fuelTime - dt / 60);
    }
  }
}
