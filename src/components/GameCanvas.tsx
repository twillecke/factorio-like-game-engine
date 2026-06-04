import { useEffect, useRef } from "react";
import { engine } from "../core/Engine";
import { world } from "../core/World";
import { Chunk } from "../entities/Chunk";
import { End } from "../entities/End";
import { Start } from "../entities/Start";
import { WorldRenderer } from "../renderers/WorldRenderer";

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    let worldRenderer: WorldRenderer;

    engine.init(canvas).then(() => {
      const chunk = new Chunk("chunk-0");
      const start = new Start();
      const end = new End();

      world.register(chunk);
      world.register(start);
      world.register(end);

      worldRenderer = new WorldRenderer();
      worldRenderer.addChunk(chunk);
      worldRenderer.addMarker(start, chunk.id);
      worldRenderer.addMarker(end, chunk.id);

      engine.ticker.add((ticker) => {
        world.update(ticker.deltaTime);
        worldRenderer.render();
      });
    });

    return () => {
      world.unregister("chunk-0");
      world.unregister("start");
      world.unregister("end");
      engine.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} style={{ display: "block" }} />;
}
