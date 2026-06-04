import { useEffect, useRef } from "react";
import { engine } from "../core/Engine";
import { world } from "../core/World";
import { Chunk } from "../entities/Chunk";
import { End } from "../entities/End";
import { Start } from "../entities/Start";
import { UserObject } from "../entities/UserObject";
import { WorldRenderer } from "../renderers/WorldRenderer";

const userObjectCounter = 0;

export function GameCanvas() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current!;
		let extraCleanup: (() => void) | null = null;

		engine.init(canvas).then(() => {
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

			engine.ticker.add((ticker) => {
				world.update(ticker.deltaTime);
				worldRenderer.render();
			});

			const userObjectIds = new Set<string>();

			const handleClick = (e: MouseEvent) => {
				const coord = worldRenderer.screenToGrid(
					e.clientX,
					e.clientY,
					chunk.id,
				);
				if (!coord) return;
				const id = `user-${coord.gridX}-${coord.gridY}`;
				if (userObjectIds.has(id)) {
					world.unregister(id);
					worldRenderer.removeUserObject(id);
					userObjectIds.delete(id);
					return;
				}
				const obj = new UserObject(id, coord.gridX, coord.gridY);
				world.register(obj);
				worldRenderer.addUserObject(obj, chunk.id);
				userObjectIds.add(id);
			};

			canvas.addEventListener("click", handleClick);

			extraCleanup = () => {
				canvas.removeEventListener("click", handleClick);
				for (const id of userObjectIds) world.unregister(id);
				worldRenderer.destroy();
			};
		});

		return () => {
			extraCleanup?.();
			world.unregister("chunk-0");
			world.unregister("start");
			world.unregister("end");
			engine.destroy();
		};
	}, []);

	return <canvas ref={canvasRef} style={{ display: "block" }} />;
}
