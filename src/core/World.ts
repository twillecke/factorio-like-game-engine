import type { Entity, Updatable } from "./types";

type RegisteredEntity = Entity & Partial<Updatable>;

class World {
  private entities = new Map<string, RegisteredEntity>();

  register(entity: RegisteredEntity): void {
    this.entities.set(entity.id, entity);
  }

  unregister(id: string): void {
    this.entities.delete(id);
  }

  get<T extends Entity>(id: string): T | undefined {
    return this.entities.get(id) as T | undefined;
  }

  update(dt: number): void {
    for (const entity of this.entities.values()) {
      entity.update?.(dt);
    }
  }
}

export const world = new World();
