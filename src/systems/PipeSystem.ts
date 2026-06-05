import type { Entity, System } from "../core/types";
import { world } from "../core/World";
import { Pipe } from "../entities/Pipe";
import { Pump } from "../entities/Pump";
import { SteamEngine } from "../entities/SteamEngine";
import { Tank } from "../entities/Tank";

function isPipe(e: Entity): e is Pipe { return e instanceof Pipe; }
function isPump(e: Entity): e is Pump { return e instanceof Pump; }
function isTank(e: Entity): e is Tank { return e instanceof Tank; }
function isSteamEngine(e: Entity): e is SteamEngine { return e instanceof SteamEngine; }
function cellKey(x: number, y: number): string { return `${x},${y}`; }

export class PipeSystem implements System {
  public update(dt: number): void {
    const pipes = world.getAll(isPipe);
    const pumps = world.getAll(isPump);
    const tanks = world.getAll(isTank);
    const steamEngines = world.getAll(isSteamEngine);

    this.resetConnections(pipes);

    const pipeAt = this.buildPipeMap(pipes);
    const filledTanks = tanks.filter((tank) => tank.isFilled);
    const connectedPipes = this.floodFill(pumps, filledTanks, pipeAt);

    for (const pipe of connectedPipes) pipe.isConnected = true;

    const connectedCells = this.buildCellKeySet(connectedPipes);
    this.fillConnectedTanks(tanks, connectedCells);
    this.updateSteamEngines(steamEngines, tanks, connectedCells, dt);
  }

  private resetConnections(pipes: Pipe[]): void {
    for (const pipe of pipes) pipe.isConnected = false;
  }

  private buildPipeMap(pipes: Pipe[]): Map<string, Pipe> {
    const map = new Map<string, Pipe>();
    for (const pipe of pipes) map.set(cellKey(pipe.gridX, pipe.gridY), pipe);
    return map;
  }

  private buildCellKeySet(pipes: Pipe[]): Set<string> {
    return new Set(pipes.map((pipe) => cellKey(pipe.gridX, pipe.gridY)));
  }

  private floodFill(pumps: Pump[], filledTanks: Tank[], pipeAt: Map<string, Pipe>): Pipe[] {
    const visited = new Set<string>();
    const queue: Pipe[] = [];

    const seedFromObject = (gridX: number, gridY: number, w: number, h: number) => {
      for (const cell of this.borderCells(gridX, gridY, w, h)) {
        const k = cellKey(cell.x, cell.y);
        const pipe = pipeAt.get(k);
        if (pipe && !visited.has(k)) { visited.add(k); queue.push(pipe); }
      }
    };

    for (const pump of pumps) seedFromObject(pump.gridX, pump.gridY, Pump.CELL_SIZE, Pump.CELL_SIZE);
    for (const tank of filledTanks) seedFromObject(tank.gridX, tank.gridY, Tank.CELL_SIZE, Tank.CELL_SIZE);

    const connected: Pipe[] = [];
    while (queue.length > 0) {
      const pipe = queue.shift()!;
      connected.push(pipe);
      for (const neighbor of this.orthogonalNeighbors(pipe.gridX, pipe.gridY)) {
        const k = cellKey(neighbor.x, neighbor.y);
        const neighborPipe = pipeAt.get(k);
        if (neighborPipe && !visited.has(k)) { visited.add(k); queue.push(neighborPipe); }
      }
    }

    return connected;
  }

  private fillConnectedTanks(tanks: Tank[], connectedCells: Set<string>): void {
    for (const tank of tanks) {
      if (tank.isFilled) continue;
      if (this.isAdjacentToAnyCell(tank.gridX, tank.gridY, Tank.CELL_SIZE, Tank.CELL_SIZE, connectedCells))
        tank.isFilled = true;
    }
  }

  private updateSteamEngines(engines: SteamEngine[], tanks: Tank[], connectedCells: Set<string>, dt: number): void {
    const activeCells = new Set<string>(connectedCells);
    for (const tank of tanks) {
      if (!tank.isFilled) continue;
      for (const cell of this.borderCells(tank.gridX, tank.gridY, Tank.CELL_SIZE, Tank.CELL_SIZE))
        activeCells.add(cellKey(cell.x, cell.y));
    }
    for (const engine of engines) {
      if (engine.fuelTime > 0) engine.fuelTime = Math.max(0, engine.fuelTime - dt / 60);
      engine.hasWater = this.isAdjacentToAnyCell(engine.gridX, engine.gridY, SteamEngine.CELL_WIDTH, SteamEngine.CELL_HEIGHT, activeCells);
    }
  }

  private isAdjacentToAnyCell(gridX: number, gridY: number, w: number, h: number, cells: Set<string>): boolean {
    for (const cell of this.borderCells(gridX, gridY, w, h))
      if (cells.has(cellKey(cell.x, cell.y))) return true;
    return false;
  }

  private borderCells(gridX: number, gridY: number, w: number, h: number): Array<{ x: number; y: number }> {
    const cells: Array<{ x: number; y: number }> = [];
    for (let col = 0; col < w; col++) {
      cells.push({ x: gridX + col, y: gridY - 1 });
      cells.push({ x: gridX + col, y: gridY + h });
    }
    for (let row = 0; row < h; row++) {
      cells.push({ x: gridX - 1, y: gridY + row });
      cells.push({ x: gridX + w, y: gridY + row });
    }
    return cells;
  }

  private orthogonalNeighbors(x: number, y: number): Array<{ x: number; y: number }> {
    return [{ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 }];
  }
}
