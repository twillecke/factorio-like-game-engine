## Factorio-like game engine

Stack: TypeScript · React 19 · PixiJS v8 · Vite

This project's goal is to develop a TypeScript game engine supporting core factorio features such as:

- Belt system carrying items
- Asset placement and removal with ghost preview and rotation
- Pipe system flooding orthogonally connected pipes, pumps and tanks
- Asset "feeding" logic. Assets connected to filled pipes or belts properly change their state.
- Toolbar UI for asset selection
- Camera module handling zoom and pan
- Debug panel to watch for entity count and types

The architecture: 
- Entity-Component-System (ECS) inspired, although not strictly. Deviation is that entities carry no components. Entities are state only
- Systems find related entities by querying World with type predicates, then update state.
- Each entity has its own renderer component implementing IEntityRenderer interface. This allows programmatically syncing all renderers in WorldRenderer wrapper.
- All rendering is handled by PixiJs. React only mounts canvas.


The core World component
- Wraps entities, systems and a spatial map
- Entities maps entities by unique id 
- The spatial map indexes entities to their grid coordinates. It supports multi-cell entities to allow placement/preview rotation. A 2×2 SpatialEntity placed at (0,0) fills four entries: ["0,0", "0,1", "1,0", "1,1"]




