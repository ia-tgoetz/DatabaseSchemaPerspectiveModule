# Skill: Canvas Interaction Standards

Expert agent for maintaining consistent UX interaction patterns in the React Flow canvas (Architecture Builder).

## Interaction Model
- **Panning**: Left-click-and-drag. Enabled via `panOnDrag={true}` in `<ReactFlow>`.
- **Zooming**: Mouse wheel scroll. Enabled via `zoomOnScroll={true}` in `<ReactFlow>`.
- **Container Interaction**:
  - Main body passes events to canvas (`pointerEvents: 'none'`).
  - `.custom-drag-handle` retains interactivity (`pointerEvents: 'auto'`).
- **Z-Indexing (Layering Hierarchy)**:
  - Base edges: Default.
  - Animated edge layers: `z-index: 1000`.
  - Waypoint handles (interaction): `z-index: 1001` (to ensure they remain draggable over animated edges).
  - Edge Labels (interaction): `z-index: 1002` (to ensure they remain draggable over animated edges). 
  - Nodes: Dependent on type (containers vs. Labels/Notes vs. architecture).

## Implementation Guidelines
- When adding new node or edge interactions, ensure they respect the pointer event passthrough and z-indexing rules defined above.
- Never use hacks like global error suppression; always resolve underlying layout or propagation issues.
