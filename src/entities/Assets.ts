import type { AssetType } from "../core/assetTypes";
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
  create: (id: string, gridX: number, gridY: number, chunkId: string, rotation?: 0 | 90 | 180 | 270) => Entity;
}

export const ASSET_DEFS: Record<AssetType, AssetDef> = {
  pipe: {
    label: "Pipe",
    idPrefix: "user",
    cellWidth: Pipe.CELL_SIZE,
    cellHeight: Pipe.CELL_SIZE,
    create: (id, x, y, chunk, rotation = 0) => new Pipe(id, x, y, chunk, rotation),
  },
  pump: {
    label: "Pump",
    idPrefix: "pump",
    cellWidth: Pump.CELL_SIZE,
    cellHeight: Pump.CELL_SIZE,
    create: (id, x, y, chunk, rotation = 0) => new Pump(id, x, y, chunk, rotation),
  },
  tank: {
    label: "Tank",
    idPrefix: "tank",
    cellWidth: Tank.CELL_SIZE,
    cellHeight: Tank.CELL_SIZE,
    create: (id, x, y, chunk, rotation = 0) => new Tank(id, x, y, chunk, rotation),
  },
  steamEngine: {
    label: "Steam Engine",
    idPrefix: "steam",
    cellWidth: SteamEngine.CELL_WIDTH,
    cellHeight: SteamEngine.CELL_HEIGHT,
    create: (id, x, y, chunk, rotation = 0) => new SteamEngine(id, x, y, chunk, rotation),
  },
};

export const ASSET_LIST = Object.keys(ASSET_DEFS) as AssetType[];
