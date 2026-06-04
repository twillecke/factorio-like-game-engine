import { CHUNK_SIZE } from "./Chunk";
import { Marker } from "./Marker";

const ROW = Math.floor((CHUNK_SIZE - Marker.CELL_SIZE) / 2);

export class Start extends Marker {
  constructor() {
    super("start", 0, ROW, 0xe74c3c);
  }
}
