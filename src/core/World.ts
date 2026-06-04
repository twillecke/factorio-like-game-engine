import type { Entity, System } from "./types";

class World {
  private entities = new Map<string, Entity>();
  private systems: System[] = [];

  register(entity: Entity): void {
    this.entities.set(entity.id, entity);
  }

  unregister(id: string): void {
    this.entities.delete(id);
  }

  get<T extends Entity>(id: string): T | undefined {
    return this.entities.get(id) as T | undefined;
  }

  getAll<T extends Entity>(predicate: (e: Entity) => e is T): T[] {
    const result: T[] = [];
    for (const e of this.entities.values()) if (predicate(e)) result.push(e);
    return result;
  }

  addSystem(system: System): void {
    this.systems.push(system);
  }

  update(dt: number): void {
    for (const system of this.systems) system.update(dt);
  }

  reset(): void {
    this.entities.clear();
    this.systems = [];
  }

  logEntities(): void {
    for (const entity of this.entities.values()) {
      console.log(`${entity.constructor.name} id="${entity.id}"`);
    }
  }
}

export const world = new World();
