import { CHUNK_SIZE } from "./Chunk";
import { Marker } from "./Marker";

const ROW = Math.floor((CHUNK_SIZE - Marker.CELL_SIZE) / 2);
const COL = CHUNK_SIZE - Marker.CELL_SIZE;

export class End extends Marker {
  constructor() {
    super("end", COL, ROW, 0x3498db);
  }
}
