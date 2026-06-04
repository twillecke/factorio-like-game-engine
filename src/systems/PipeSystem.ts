import type { Entity, System } from "../core/types";
import { world } from "../core/World";
import { Marker } from "../entities/Marker";
import { Pipe } from "../entities/Pipe";
import { Start } from "../entities/Start";

function isPipe(e: Entity): e is Pipe { return e instanceof Pipe; }
function isStart(e: Entity): e is Start { return e instanceof Start; }
function key(x: number, y: number): string { return `${x},${y}`; }

export class PipeSystem implements System {
  update(_dt: number): void {
    const pipes = world.getAll(isPipe);
    const starts = world.getAll(isStart);

    this.resetConnections(pipes);

    const pipeAt = this.buildPipeMap(pipes);
    const reachable = this.floodFill(starts, pipeAt);

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

  private floodFill(starts: Start[], pipeAt: Map<string, Pipe>): Pipe[] {
    const visited = new Set<string>();
    const queue: Pipe[] = [];

    for (const start of starts) {
      for (const { x, y } of this.cellsAdjacentToMarker(start)) {
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

  private cellsAdjacentToMarker(marker: Marker): Array<{ x: number; y: number }> {
    const size = Marker.CELL_SIZE;
    const cells: Array<{ x: number; y: number }> = [];

    // top and bottom edges (including corners)
    for (let dx = -1; dx <= size; dx++) {
      cells.push({ x: marker.gridX + dx, y: marker.gridY - 1 });
      cells.push({ x: marker.gridX + dx, y: marker.gridY + size });
    }
    // left and right edges (excluding corners)
    for (let dy = 0; dy < size; dy++) {
      cells.push({ x: marker.gridX - 1,    y: marker.gridY + dy });
      cells.push({ x: marker.gridX + size, y: marker.gridY + dy });
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
