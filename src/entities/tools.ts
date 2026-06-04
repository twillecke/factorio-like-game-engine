import type { ToolType } from "../core/toolTypes";
import type { Entity } from "../core/types";
import { Pipe } from "./Pipe";
import { Pump } from "./Pump";
import { Tank } from "./Tank";

export interface ToolDef {
  label: string;
  idPrefix: string;
  cellSize: number;
  create: (id: string, gridX: number, gridY: number, chunkId: string) => Entity;
}

export const TOOL_DEFS: Record<ToolType, ToolDef> = {
  pipe: {
    label: "Pipe",
    idPrefix: "user",
    cellSize: Pipe.CELL_SIZE,
    create: (id, x, y, chunk) => new Pipe(id, x, y, chunk),
  },
  pump: {
    label: "Pump",
    idPrefix: "pump",
    cellSize: Pump.CELL_SIZE,
    create: (id, x, y, chunk) => new Pump(id, x, y, chunk),
  },
  tank: {
    label: "Tank",
    idPrefix: "tank",
    cellSize: Tank.CELL_SIZE,
    create: (id, x, y, chunk) => new Tank(id, x, y, chunk),
  },
};

export const TOOL_LIST = Object.keys(TOOL_DEFS) as ToolType[];
