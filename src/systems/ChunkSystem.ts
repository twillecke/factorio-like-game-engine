import type { System } from "../core/types";
import { world } from "../core/World";
import { Chunk } from "../entities/Chunk";

function isChunk(e: object): e is Chunk {
  return e instanceof Chunk;
}

export class ChunkSystem implements System {
  update(_dt: number): void {
    const chunks = world.getAll(isChunk);
    for (const chunk of chunks) {
      void chunk; // placeholder — belt/production logic goes here
    }
  }
}
