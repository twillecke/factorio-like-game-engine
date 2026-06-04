import type { Entity, System } from "../core/types";
import { world } from "../core/World";
import { Pipe } from "../entities/Pipe";
import { Pump } from "../entities/Pump";
import { Tank } from "../entities/Tank";

function isPipe(e: Entity): e is Pipe { return e instanceof Pipe; }
function isPump(e: Entity): e is Pump { return e instanceof Pump; }
function isTank(e: Entity): e is Tank { return e instanceof Tank; }
function key(x: number, y: number): string { return `${x},${y}`; }

export class PipeSystem implements System {
  update(_dt: number): void {
    const pipes = world.getAll(isPipe);
    const pumps = world.getAll(isPump);
    const tanks = world.getAll(isTank);

    this.resetConnections(pipes);

    const pipeAt = this.buildPipeMap(pipes);
    const filledTanks = tanks.filter((t) => t.isFilled);
    const reachable = this.floodFill(pumps, filledTanks, pipeAt);

    for (const pipe of reachable) pipe.isConnected = true;

    this.fillConnectedTanks(tanks, reachable);
  }

  private resetConnections(pipes: Pipe[]): void {
    for (const pipe of pipes) pipe.isConnected = false;
  }

  private buildPipeMap(pipes: Pipe[]): Map<string, Pipe> {
    const map = new Map<string, Pipe>();
    for (const pipe of pipes) map.set(key(pipe.gridX, pipe.gridY), pipe);
    return map;
  }

  private floodFill(pumps: Pump[], filledTanks: Tank[], pipeAt: Map<string, Pipe>): Pipe[] {
    const visited = new Set<string>();
    const queue: Pipe[] = [];

    const seed = (gridX: number, gridY: number, size: number) => {
      for (const { x, y } of this.cellsAdjacentToObject(gridX, gridY, size)) {
        const k = key(x, y);
        const pipe = pipeAt.get(k);
        if (pipe && !visited.has(k)) {
          visited.add(k);
          queue.push(pipe);
        }
      }
    };

    for (const pump of pumps) seed(pump.gridX, pump.gridY, Pump.CELL_SIZE);
    for (const tank of filledTanks) seed(tank.gridX, tank.gridY, Tank.CELL_SIZE);

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

  private fillConnectedTanks(tanks: Tank[], connectedPipes: Pipe[]): void {
    const connectedKeys = new Set(connectedPipes.map(p => key(p.gridX, p.gridY)));
    for (const tank of tanks) {
      if (tank.isFilled) continue;
      for (const { x, y } of this.cellsAdjacentToObject(tank.gridX, tank.gridY, Tank.CELL_SIZE)) {
        if (connectedKeys.has(key(x, y))) {
          tank.isFilled = true;
          break;
        }
      }
    }
  }

  private cellsAdjacentToObject(gridX: number, gridY: number, size: number): Array<{ x: number; y: number }> {
    const cells: Array<{ x: number; y: number }> = [];
    for (let dx = 0; dx < size; dx++) {
      cells.push({ x: gridX + dx, y: gridY - 1 });
      cells.push({ x: gridX + dx, y: gridY + size });
    }
    for (let dy = 0; dy < size; dy++) {
      cells.push({ x: gridX - 1,    y: gridY + dy });
      cells.push({ x: gridX + size, y: gridY + dy });
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
