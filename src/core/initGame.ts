import { Belt } from "../entities/Belt";
import { BeltItem } from "../entities/BeltItem";
import { Chunk } from "../entities/Chunk";
import { BeltSystem } from "../systems/BeltSystem";
import { ChunkSystem } from "../systems/ChunkSystem";
import { PipeSystem } from "../systems/PipeSystem";
import { SteamEngineSystem } from "../systems/SteamEngineSystem";
import { InputHandler } from "../controllers/InputHandler";
import { PlacementController } from "../controllers/PlacementController";
import { WorldRenderer } from "../renderers/WorldRenderer";
import { engine } from "./Engine";
import { world } from "./World";

export interface GameHandle {
  placement: PlacementController | null;
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

    const placement = new PlacementController(chunk.id, worldRenderer.preview);
    handle.placement = placement;

    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    const input = new InputHandler(canvas, worldRenderer, chunk.id, {
      onCellAdd: (x, y) => placement.placeAt(x, y),
      onCellRemove: (x, y) => placement.removeAt(x, y),
      onCellHover: (x, y) => placement.hoverAt(x, y),
      onHoverLeave: () => placement.clearHover(),
      onRotate: () => placement.rotate(),
      onInsertItem: (x, y) => {
        const belt = world.getSpatial<Belt>(x, y);
        if (belt instanceof Belt) world.register(BeltItem.create("coal", belt.id));
      },
    });

    const pipeSystem = new PipeSystem();
    world.addSystem(new ChunkSystem());
    world.addSystem(pipeSystem);
    world.addSystem(new SteamEngineSystem(pipeSystem));
    world.addSystem(new BeltSystem());

    engine.ticker.add((ticker) => {
      world.update(ticker.deltaTime);
      worldRenderer.render();
    });

    extraCleanup = () => {
      input.destroy();
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
