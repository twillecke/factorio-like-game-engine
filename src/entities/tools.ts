import type { AssetType } from "../core/toolTypes";
import type { Entity } from "../core/types";
import { Pipe } from "./Pipe";
import { Pump } from "./Pump";
import { SteamEngine } from "./SteamEngine";
import { Tank } from "./Tank";

export interface AssetDef {
  label: string;
  idPrefix: string;
  cellWidth: number;
  cellHeight: number;
  create: (id: string, gridX: number, gridY: number, chunkId: string) => Entity;
}

export const ASSET_DEFS: Record<AssetType, AssetDef> = {
  pipe: {
    label: "Pipe",
    idPrefix: "user",
    cellWidth: Pipe.CELL_SIZE,
    cellHeight: Pipe.CELL_SIZE,
    create: (id, x, y, chunk) => new Pipe(id, x, y, chunk),
  },
  pump: {
    label: "Pump",
    idPrefix: "pump",
    cellWidth: Pump.CELL_SIZE,
    cellHeight: Pump.CELL_SIZE,
    create: (id, x, y, chunk) => new Pump(id, x, y, chunk),
  },
  tank: {
    label: "Tank",
    idPrefix: "tank",
    cellWidth: Tank.CELL_SIZE,
    cellHeight: Tank.CELL_SIZE,
    create: (id, x, y, chunk) => new Tank(id, x, y, chunk),
  },
  steamEngine: {
    label: "Steam Engine",
    idPrefix: "steam",
    cellWidth: SteamEngine.CELL_WIDTH,
    cellHeight: SteamEngine.CELL_HEIGHT,
    create: (id, x, y, chunk) => new SteamEngine(id, x, y, chunk),
  },
};

export const ASSET_LIST = Object.keys(ASSET_DEFS) as AssetType[];
