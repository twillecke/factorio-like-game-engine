import { Belt } from "../entities/Belt";
import { BeltItem } from "../entities/BeltItem";
import { Chunk } from "../entities/Chunk";
import { BeltSystem } from "../systems/BeltSystem";
import { ChunkSystem } from "../systems/ChunkSystem";
import { InputSystem } from "../systems/InputSystem";
import { PipeSystem } from "../systems/PipeSystem";
import { PlacementSystem } from "../systems/PlacementSystem";
import { SteamEngineSystem } from "../systems/SteamEngineSystem";
import { WorldRenderer } from "../renderers/WorldRenderer";
import { engine } from "./Engine";
import { world } from "./World";

export interface GameHandle {
  placement: PlacementSystem | null;
  destroy: () => void;
}

export function initGame(container: HTMLElement): GameHandle {
  const handle: GameHandle = { placement: null, destroy: () => {} };
  let cancelled = false;
  let extraCleanup: (() => void) | null = null;
  engine.init(container).then(() => {
    if (cancelled) { engine.destroy(); return; }
    const canvas = engine.app.canvas as HTMLCanvasElement;
    const chunk = new Chunk("chunk-0");
    world.register(chunk);
    const worldRenderer = new WorldRenderer();
    worldRenderer.addChunk(chunk);
    const placementSystem = new PlacementSystem(chunk.id, worldRenderer.preview);
    handle.placement = placementSystem;
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    const inputSystem = new InputSystem(canvas, worldRenderer, chunk.id, {
      onCellAdd: (x, y) => placementSystem.placeAt(x, y),
      onCellRemove: (x, y) => placementSystem.removeAt(x, y),
      onCellHover: (x, y) => placementSystem.hoverAt(x, y),
      onHoverLeave: () => placementSystem.clearHover(),
      onRotate: () => placementSystem.rotate(),
      onInsertItem: (x, y) => {
        const belt = world.getSpatial<Belt>(x, y);
        if (belt instanceof Belt) world.register(BeltItem.create("coal", belt.id));
      },
    });
    const pipeSystem = new PipeSystem();
    world.addSystem(new ChunkSystem());
    world.addSystem(placementSystem);
    world.addSystem(pipeSystem);
    world.addSystem(new SteamEngineSystem(pipeSystem));
    world.addSystem(new BeltSystem());
    world.addSystem(inputSystem);
    engine.ticker.add((ticker) => {
      world.update(ticker.deltaTime);
      worldRenderer.render();
    });
    extraCleanup = () => {
      inputSystem.destroy();
      worldRenderer.destroy();
    };
  }).catch((err) => {
    console.error("[initGame] engine.init failed:", err);
  });

  handle.destroy = () => {
    cancelled = true;
    extraCleanup?.();
    world.reset();
    engine.destroy();
  };

  return handle;
}
