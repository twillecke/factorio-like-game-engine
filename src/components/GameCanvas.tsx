import { useEffect, useRef } from "react";
import { engine } from "../core/Engine";
import { world } from "../core/World";
import { Chunk } from "../entities/Chunk";
import { End } from "../entities/End";
import { Start } from "../entities/Start";
import { WorldRenderer } from "../renderers/WorldRenderer";
import { ChunkSystem } from "../systems/ChunkSystem";
import { InputSystem } from "../systems/InputSystem";

export function GameCanvas() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current!;
		let cancelled = false;
		let extraCleanup: (() => void) | null = null;

		engine.init(canvas).then(() => {
			if (cancelled) return;
			const chunk = new Chunk("chunk-0");
			const start = new Start();
			const end = new End();

			world.register(chunk);
			world.register(start);
			world.register(end);

			const worldRenderer = new WorldRenderer();
			worldRenderer.addChunk(chunk);
			worldRenderer.addMarker(start, chunk.id);
			worldRenderer.addMarker(end, chunk.id);

			const inputSystem = new InputSystem(canvas, worldRenderer, chunk.id);
			world.addSystem(new ChunkSystem());
			world.addSystem(inputSystem);

      // setInterval(() => {
      //   console.log("=== World entities ===");
      //   world.logEntities();
      // }, 2000);

			engine.ticker.add((ticker) => {
				world.update(ticker.deltaTime);
				worldRenderer.render();
			});

			extraCleanup = () => {
				inputSystem.destroy();
				worldRenderer.destroy();
			};
		});

		return () => {
			cancelled = true;
			extraCleanup?.();
			world.reset();
			engine.destroy();
		};
	}, []);

	return <canvas ref={canvasRef} style={{ display: "block" }} />;
}
