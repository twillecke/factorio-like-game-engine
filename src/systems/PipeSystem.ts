import type { Entity, System } from "../core/types";
import { world } from "../core/World";
import { Pipe } from "../entities/Pipe";
import { Pump } from "../entities/Pump";

function isPipe(e: Entity): e is Pipe { return e instanceof Pipe; }
function isPump(e: Entity): e is Pump { return e instanceof Pump; }
function key(x: number, y: number): string { return `${x},${y}`; }

export class PipeSystem implements System {
  update(_dt: number): void {
    const pipes = world.getAll(isPipe);
    const pumps = world.getAll(isPump);

    this.resetConnections(pipes);

    const pipeAt = this.buildPipeMap(pipes);
    const reachable = this.floodFill(pumps, pipeAt);

    for (const pipe of reachable) pipe.isConnected = true;
  }

  private resetConnections(pipes: Pipe[]): void {
    for (const pipe of pipes) pipe.isConnected = false;
  }

  private buildPipeMap(pipes: Pipe[]): Map<string, Pipe> {
    const map = new Map<string, Pipe>();
    for (const pipe of pipes) map.set(key(pipe.gridX, pipe.gridY), pipe);
    return map;
  }

  private floodFill(pumps: Pump[], pipeAt: Map<string, Pipe>): Pipe[] {
    const visited = new Set<string>();
    const queue: Pipe[] = [];

    for (const pump of pumps) {
      for (const { x, y } of this.cellsAdjacentToPump(pump)) {
        const pipe = pipeAt.get(key(x, y));
        if (pipe && !visited.has(key(x, y))) {
          visited.add(key(x, y));
          queue.push(pipe);
        }
      }
    }

    const connected: Pipe[] = [];
    while (queue.length > 0) {
      const pipe = queue.shift()!;
      connected.push(pipe);
      for (const { x, y } of this.orthogonalNeighbors(pipe.gridX, pipe.gridY)) {
        const neighbor = pipeAt.get(key(x, y));
        if (neighbor && !visited.has(key(x, y))) {
          visited.add(key(x, y));
          queue.push(neighbor);
        }
      }
    }

    return connected;
  }

  private cellsAdjacentToPump(pump: Pump): Array<{ x: number; y: number }> {
    const size = Pump.CELL_SIZE;
    const cells: Array<{ x: number; y: number }> = [];

    for (let dx = -1; dx <= size; dx++) {
      cells.push({ x: pump.gridX + dx, y: pump.gridY - 1 });
      cells.push({ x: pump.gridX + dx, y: pump.gridY + size });
    }
    for (let dy = 0; dy < size; dy++) {
      cells.push({ x: pump.gridX - 1,    y: pump.gridY + dy });
      cells.push({ x: pump.gridX + size, y: pump.gridY + dy });
    }

    return cells;
  }

  private orthogonalNeighbors(x: number, y: number): Array<{ x: number; y: number }> {
    return [
      { x: x + 1, y },
      { x: x - 1, y },
      { x, y: y + 1 },
      { x, y: y - 1 },
    ];
  }
}
