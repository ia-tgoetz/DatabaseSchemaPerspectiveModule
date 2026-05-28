# Skill: Ignition Component Generator
Expert agent for scaffolding new Perspective components in the `reactflow-module`.

## Goal
To automate the creation of the Java metadata, JSON schemas, and React components required for a new Ignition Perspective component.

## Core Mandates
- **Tri-Layer Generation:** Every component must have a `Meta.java` (Java), `props.json` (Common), and `.tsx` (React) layer.
- **Strict Wiring:** Automatically update `perspective-client.ts` to register the new component and its props reducer.
- **Gateway Registration:** Automatically update `GatewayHook.java` to register the new component descriptor.
- **Consistent Naming:** Follow the existing PascalCase for components and camelCase for IDs.

## Workflow

### 1. Definition
Ask the user for:
- Component Name (e.g., `TrendChart`)
- Palette Category (default: `WARGoetz`)
- Primary Props (e.g., `data`, `style`, `options`)

### 2. Scaffolding
1. **Java Meta:** Create `reactflow-module/common/src/main/java/com/wargoetz/reactflow/common/[Name]Meta.java`.
2. **JSON Props:** Create `reactflow-module/common/src/main/resources/[name].props.json`.
3. **React Component:** Create `reactflow-module/web/packages/client/typescript/components/[Name]/[Name].tsx`.

### 3. Wiring
1. **Frontend:** Update `reactflow-module/web/packages/client/typescript/perspective-client.ts`.
2. **Backend:** Update `reactflow-module/gateway/src/main/java/com/wargoetz/reactflow/gateway/GatewayHook.java`.

## Operational Patterns

### Java Template Pattern
Use `JsonEditorMeta.java` as a reference for:
- `COMPONENT_ID` and `MODULE_ID`
- `JS_RESOURCE` and `DESIGNER_JS_RESOURCE`
- `DESCRIPTOR` builder pattern
- `createDefaultProps()` method

### React Template Pattern
Use `reactflow-module/web/packages/client/typescript/components/common/PerspectiveComponent.tsx` (if it exists) or a sibling component as a base for MobX integration and Ignition prop syncing.

## Available Resources
- `reactflow-module/common/src/main/java/com/wargoetz/reactflow/common/JsonEditorMeta.java`: Reference Meta file.
- `reactflow-module/web/packages/client/typescript/perspective-client.ts`: Wiring target.
- `reactflow-module/gateway/src/main/java/com/wargoetz/reactflow/gateway/GatewayHook.java`: Registration target.
