import type { Entity, SpatialEntity, System } from "./types";

class World {
  private entities = new Map<string, Entity>();
  private systems: System[] = [];
  private spatial = new Map<string, SpatialEntity>();

  public register(entity: Entity): void {
    this.entities.set(entity.id, entity);
  }

  public registerSpatial(entity: SpatialEntity): void {
    this.entities.set(entity.id, entity);
    for (let dx = 0; dx < entity.effectiveCellWidth; dx++)
      for (let dy = 0; dy < entity.effectiveCellHeight; dy++)
        this.spatial.set(`${entity.gridX + dx},${entity.gridY + dy}`, entity);
  }

  public unregister(id: string): void {
    this.entities.delete(id);
  }

  public unregisterSpatial(entity: SpatialEntity): void {
    for (let dx = 0; dx < entity.effectiveCellWidth; dx++)
      for (let dy = 0; dy < entity.effectiveCellHeight; dy++)
        this.spatial.delete(`${entity.gridX + dx},${entity.gridY + dy}`);
    this.entities.delete(entity.id);
  }

  public get<T extends Entity>(id: string): T | undefined {
    return this.entities.get(id) as T | undefined;
  }

  public getAll<T extends Entity>(predicate: (e: Entity) => e is T): T[] {
    const result: T[] = [];
    for (const e of this.entities.values()) if (predicate(e)) result.push(e);
    return result;
  }

  public addSystem(system: System): void {
    this.systems.push(system);
  }

  public update(dt: number): void {
    for (const system of this.systems) system.update(dt);
  }

  public getSpatial<T extends Entity>(x: number, y: number): T | undefined {
    return this.spatial.get(`${x},${y}`) as T | undefined;
  }

  public reset(): void {
    this.entities.clear();
    this.spatial.clear();
    this.systems = [];
  }

  public getEntityCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const entity of this.entities.values()) {
      const type = entity.constructor.name;
      counts[type] = (counts[type] ?? 0) + 1;
    }
    return counts;
  }

  public logEntities(): void {
    for (const entity of this.entities.values()) {
      console.log(`${entity.constructor.name} id="${entity.id}"`);
    }
  }
}

export const world = new World();
