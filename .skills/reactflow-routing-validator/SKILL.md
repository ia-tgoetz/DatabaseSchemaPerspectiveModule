---
name: reactflow-routing-validator
description: Expert agent for maintaining and auditing orthogonal edge routing and handle integrity in the "Architecture Builder" component. Use when auditing routing logic, fixing "zigzag" bugs, or ensuring handle persistence and usability standards.
---
# Skill: ReactFlow Routing Validator
Expert agent for maintaining and auditing orthogonal edge routing and handle integrity in the "Architecture Builder" component.

## Goal
To ensure all edge routing logic and handle implementations adhere to the strict rules defined for the Architecture Builder, ensuring functional usability, visual precision, and structural integrity.

## Core Mandates
- **Strict Orthogonality:** Segments MUST be strictly horizontal or vertical (delta X or delta Y is 0).
- **Handle Respect:** Edges MUST exit and enter perpendicular to the handle side.
- **Waypoint Primacy:** `waypoints[]` is the ONLY source of truth for routing.
- **No Direct Props:** Never pass `selected` at the top level of an edge object (causes ReactFlow drag re-renders).
- **Handle Persistence (Structural Integrity):** Handles MUST ALWAYS exist in the DOM with stable dimensions (even if `opacity: 0`) to keep edges firmly anchored. Removing handles from the DOM breaks React Flow's edge pathing.
- **Interaction Generosity (Functional Usability):** Handle hit areas MUST be zoom-aware and large enough for easy interaction (targeting ~24px at 1.0 zoom, scaling up to ~40px at low zoom).
- **Visual Minimalism (Visual Precision):** Handles MUST be "invisible when idle" (opacity 0) to maintain a zero-footprint aesthetic, appearing only during node/handle hover, selection, or edge interaction.

## Workflow

### 1. Code Audit
When modifying `EdgeUtils.ts`, `CustomEdge.tsx`, or `ArchitectureNode.tsx`:
1. Check that `computeAutoWaypoints` still generates valid orthogonal paths.
2. Ensure `buildPolylinePath` correctly handles `pinnedWaypoints`.
3. Verify that `selected` state is handled via `data` or `style`, not top-level props.
4. **NEW:** Ensure handles in `ArchitectureNode.tsx` maintain persistent dimensions and use CSS opacity for visibility control.

### 2. Implementation Check
When a user reports "edges are diagonal", "drag is laggy", or "handles are hard to hit":
1. Inspect the `waypoints` array in the component state.
2. Check if first/last waypoints are being pinned relative to node handles.
3. Validate that axis-locking is enforced in the drag handlers.
4. **NEW:** Verify handle `hitSize` scales correctly with zoom and z-index ensures they are interactable.

### 3. Rule Verification
Verify changes against these 11 rules:
1. Segments are strictly horizontal or vertical (Stepped/Smooth types).
2. Exit/Entry is perpendicular to handle side.
3. `buildPolylinePath` is used for rendering.
4. Waypoints are lazy (computed on drag).
5. First/Last waypoints are pinned every render.
6. `selected` is NOT a top-level edge prop.
7. Segment drag is axis-locked and snap-aware.
8. `waypoints[]` is the sole source of truth.
9. **Handle Persistence:** Handles never leave the DOM while edges are connected.
10. **Zero-Footprint:** Handles have zero layout impact and are invisible when idle.
11. **Zoom-Aware Hit Area:** Interaction targets remain easy to hit regardless of zoom level.

## Operational Patterns

### Path Logic
Refer to `reactflow-module/web/packages/client/typescript/components/ArchitectureBuilder/EdgeUtils.ts` for:
- `getHandlePixelPos`: Correct handle coordinates.
- `computeAutoWaypoints`: The L-shape/Z-shape/U-shape logic.
- `buildPolylinePath`: The SVG `d` string generation.

## Available Resources
- `reactflow-module/ArchBuilderREADME.md`: Detailed visual behavior documentation.
- `reactflow-module/web/packages/client/typescript/components/ArchitectureBuilder/EdgeUtils.ts`: Routing implementation.
- `reactflow-module/web/packages/client/typescript/components/ArchitectureBuilder/CustomEdge.tsx`: Edge component.
