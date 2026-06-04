import type { Entity, System } from "../core/types";
import { world } from "../core/World";
import { Marker } from "../entities/Marker";
import { Pipe } from "../entities/Pipe";
import { Start } from "../entities/Start";

function isPipe(e: Entity): e is Pipe {
  return e instanceof Pipe;
}

function isStart(e: Entity): e is Start {
  return e instanceof Start;
}

export class PipeSystem implements System {
  update(_dt: number): void {
    const pipes = world.getAll(isPipe);
    for (const p of pipes) p.isConnected = false;

    const starts = world.getAll(isStart);
    if (starts.length === 0) return;

    const pipeMap = new Map<string, Pipe>();
    for (const p of pipes) pipeMap.set(`${p.gridX},${p.gridY}`, p);

    const visited = new Set<string>();
    const queue: Array<{ x: number; y: number }> = [];

    for (const start of starts) {
      for (const cell of this.borderCells(start)) {
        const key = `${cell.x},${cell.y}`;
        if (!visited.has(key) && pipeMap.has(key)) {
          visited.add(key);
          queue.push(cell);
        }
      }
    }

    while (queue.length > 0) {
      const { x, y } = queue.shift()!;
      const pipe = pipeMap.get(`${x},${y}`)!;
      pipe.isConnected = true;
      for (const n of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]] as [number, number][]) {
        const key = `${n[0]},${n[1]}`;
        if (!visited.has(key) && pipeMap.has(key)) {
          visited.add(key);
          queue.push({ x: n[0], y: n[1] });
        }
      }
    }
  }

  private borderCells(marker: Marker): Array<{ x: number; y: number }> {
    const s = Marker.CELL_SIZE;
    const cells: Array<{ x: number; y: number }> = [];
    for (let d = -1; d <= s; d++) {
      cells.push({ x: marker.gridX + d, y: marker.gridY - 1 });
      cells.push({ x: marker.gridX + d, y: marker.gridY + s });
    }
    for (let d = 0; d < s; d++) {
      cells.push({ x: marker.gridX - 1, y: marker.gridY + d });
      cells.push({ x: marker.gridX + s, y: marker.gridY + d });
    }
    return cells;
  }
}
