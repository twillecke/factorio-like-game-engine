import { useEffect, useRef } from "react";
import { engine } from "../core/Engine";
import type { AssetType } from "../entities/assetTypes";
import { world } from "../core/World";
import { Chunk } from "../entities/Chunk";
import { WorldRenderer } from "../renderers/WorldRenderer";
import { Belt } from "../entities/Belt";
import { BeltItem } from "../entities/BeltItem";
import { BeltSystem } from "../systems/BeltSystem";
import { ChunkSystem } from "../systems/ChunkSystem";
import { InputSystem } from "../systems/InputSystem";
import { PipeSystem } from "../systems/PipeSystem";
import { PlacementSystem } from "../systems/PlacementSystem";
import { SteamEngineSystem } from "../systems/SteamEngineSystem";

interface GameCanvasProps {
  tool: AssetType | null;
}

export function GameCanvas({ tool }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const placementRef = useRef<PlacementSystem | null>(null);

  useEffect(() => {
    const container = containerRef.current!;
    let cancelled = false;
    let extraCleanup: (() => void) | null = null;

    engine.init(container).then(() => {
      if (cancelled) {
        engine.destroy();
        return;
      }
      const canvas = engine.app.canvas as HTMLCanvasElement;
      const chunk = new Chunk("chunk-0");

      world.register(chunk);

      const worldRenderer = new WorldRenderer();
      worldRenderer.addChunk(chunk);

      const placementSystem = new PlacementSystem(chunk.id, worldRenderer.preview);
      placementRef.current = placementSystem;

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
      world.addSystem(new ChunkSystem());
      world.addSystem(placementSystem);
      const pipeSystem = new PipeSystem();
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
      console.error("[GameCanvas] engine.init failed:", err);
    });

    return () => {
      cancelled = true;
      placementRef.current = null;
      extraCleanup?.();
      world.reset();
      engine.destroy();
    };
  }, []);

  useEffect(() => {
    placementRef.current?.setTool(tool);
  }, [tool]);

  return <div ref={containerRef} style={{ display: "block" }} />;
}
