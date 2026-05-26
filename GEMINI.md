# Ignition Perspective React Flow Module (WARGoetz Visualization Components)

This project is a custom Ignition Perspective module that provides a suite of interactive, React Flow-based components. It is **Repo 3 of a 3-Repo Ecosystem** (Admin Manager, Public Project, ReactFlow Module).

## 🏗️ Architecture & Technology Stack

- **Platform:** Inductive Automation Ignition 8.3.0+
- **Backend:** Java 17, Gradle (Multi-module structure)
- **Frontend:** React 18, TypeScript, React Flow v11, Styled Components, MobX
- **Build System:** Gradle for module assembly, Yarn/Lerna for frontend assets.

### Module Structure
- `/common`: Shared Java classes, component metadata (`*Meta.java`), and JSON prop schemas (`*.props.json`).
- `/gateway`: Gateway hook for component registration and server-side logic.
- `/designer`: Designer hook for designer-specific behavior.
- `/web`: Frontend workspace containing Lerna packages.
    - `/web/packages/client`: Primary React component implementation.
    - `/web/packages/designer`: Designer-specific React wrappers.

## 🚀 Building and Running

### Prerequisites
- JDK 17
- Node.js & Yarn (managed automatically by Gradle)
- Ignition 8.3 Development Gateway

### 💡 Lifecycle Automation
For faster development loops, use the **[Ignition Module Lifecycle skill](../.skills/ignition-module-lifecycle/SKILL.md)**.
- **Fast Deploy:** Build and restart gateway in one command.
- **Health Checks:** Auto-waits for the gateway to reach "RUNNING" state.

### Key Commands
- **Full Build:** `./gradlew clean build`
  Generates the `.modl` file in `build/`.
- **Fast Deploy:** `./gradlew installModule`
  Installs the module directly to a local test gateway (requires `ia.developer.moduleupload=true` in `ignition.conf`).
- **Clean Project:** `./gradlew clean`
- **Deep Clean:** `./gradlew deepClean` (removes `node_modules` and caches).

### Frontend Build Process
The `web/` directory uses the `com.github.node-gradle.node` plugin.
1. `yarn install` is executed at the root of `/web`.
2. `lerna run build` is executed to compile all packages.
3. Webpack bundles the components into `WARGoetzComponents.js` and `WARGoetzComponents.css`.

## 🛠️ Development Conventions

### Component Registration (Critical)
- **Backend:** Components are registered in `GatewayHook.java` using the `PerspectiveContext` component registry.
- **Frontend Wiring:** Every property defined in a component's `*.props.json` MUST be wired in `perspective-client.ts` inside the `getPropsReducer(tree)` method. If a prop is missing there, it will not be accessible in the React component.

### Architecture Builder Routing & Handle Standards (The "Holy Grail" Design)
The `ArchitectureBuilder` component follows 11 strict rules to ensure functional usability, visual precision, and structural integrity:
1.  **Orthogonality:** Segments MUST be strictly horizontal or vertical.
2.  **Handle Respect:** Edges MUST exit/enter perpendicular to the handle side.
3.  **Path Rendering:** All step/smoothstep edges render via `buildPolylinePath(pinnedWaypoints)`.
4.  **Lazy Waypoints:** Waypoints are stored lazily (empty on connect, computed on drag).
5.  **Pinning:** Pin first/last waypoints every render to keep exits perpendicular.
6.  **Performance:** Do NOT pass `selected` at the top level of an edge object (prevents re-render lag).
7.  **Drag Lock:** Segment drag is axis-locked and snap-aware.
8.  **Source of Truth:** `waypoints[]` is the only source of truth for routing.
9.  **Handle Persistence (Integrity):** Handles MUST ALWAYS exist in the DOM with stable dimensions (even if `opacity: 0`) to keep edges firmly anchored.
10. **Visual Minimalism (Precision):** Handles are "invisible when idle" (opacity 0) to maintain a zero-footprint aesthetic, appearing only on hover, selection, or interaction.
11. **Interaction Generosity (Usability):** Handle hit areas (via `::before`) MUST be zoom-aware (targeting ~24px at 1.0 zoom, up to ~40px at low zoom).

### Technical Constraints
- **Jython 2.7:** Use Python 2.7 syntax for all Ignition-side scripts.
- **Java 17:** Use modern Java features for backend code.
- **Prop Write-backs:** Use `props.write()` to sync canvas state back to the Gateway.

## 📂 Key Files
- `CLAUDE.md`: Contains detailed technical standards and automation commands.
- `ArchBuilderREADME.md`: Exhaustive documentation for the Architecture Builder component.
- `web/packages/client/typescript/perspective-client.ts`: The entry point for frontend component registration and prop wiring.
- `gateway/src/main/java/com/wargoetz/reactflow/gateway/GatewayHook.java`: The primary module entry point.
- `common/src/main/resources/*.props.json`: The source of truth for component property structures.
