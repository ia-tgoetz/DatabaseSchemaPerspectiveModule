# Architecture Builder User Guide

A React Flow-based Perspective component for creating interactive system architecture diagrams.

## 🏗️ Overview

The Architecture Builder renders a pan/zoom infinite canvas. Users drag palette items onto the canvas to place nodes, draw edges between them, group nodes inside container zones, and export the full state as structured JSON through Ignition's prop system.

---

## ⚙️ Component Property Tree

### Configuration Properties
*   **`enabled`** (boolean): Enables/disables palette and editing interactions.
*   **`enableOnClickEvents`** (boolean): Allows click events to fire even if `enabled` is false.
*   **`snapEnabled`** (boolean): Enables grid snapping for node movement.
*   **`snapPixels`** (number): Grid size in pixels for snapping.
*   **`edgeWidth`** (number): Global stroke width for edges.
*   **`hideHandles`** (boolean): Globally hides connection handles.
*   **`handleCount`** (number): Global number of connection handles per side (1–8).
*   **`refreshHierarchy`** (boolean): Toggle to force recalculation of the hierarchy/connections.
*   **`style`** (object): Standard Perspective style properties for the wrapper.

### Data Structures

#### `paletteItems` (Array of Objects)
*   **`id`** (string): Unique identifier.
*   **`typeId`** (string): Secondary identifier used for node type classification.
*   **`category`** (string): Sidebar grouping category.
*   **`label`** (string): Display label.
*   **`tooltip`** (string): Hover tooltip text.
*   **`image`** / **`overrideImage`** (string): SVG/Base64 image sources.
*   **`supportedConnections`** (string[]): Types of connections this item supports.
*   **`swappableWith`** (string[]): Palette IDs this item can swap into.
*   **`defaultConfigs`** (object): Configuration object applied when dropped.
*   **`hideHandles`** (boolean): Per-item handle visibility override.
*   **`style`** / **`labelStyle`** (object): Component visual style overrides.

#### `connectionTypes` (Object Map)
*   *Key*: Connection Type ID
    *   **`label`** (string): UI label.
    *   **`color`** (string): Stroke color.
    *   **`docs`** (string): Reference URL.
    *   **`multiple`** (boolean): Allow multiple connections of this type between nodes.
    *   **`arrow`** (boolean): Render arrowhead.

#### `nodes` (Object Map)
*   *Key*: Node UUID
    *   **`paletteId`** / **`typeId`** (string)
    *   **`label`** / **`tooltip`** (string)
    *   **`image`** (string): Icon data.
    *   **`x`** / **`y`** (number): Canvas position.
    *   **`inactive`** (boolean): Grayscale/blur status.
    *   **`text`** / **`textStyle`** (string/object): Content for Notes/Labels.
    *   **`useOverrideImage`** (boolean): Toggle for primary/override icon.
    *   **`width`** / **`height`** / **`zIndex`** (number): Container metrics.
    *   **`configs`** (object): Custom configuration.
    *   **`style`** / **`labelStyle`** (object): Visual overrides.
    *   **`hierarchy`** (string[]): *Computed* parent containers.
    *   **`connections`** (string[]): *Computed* active edges.

#### `edges` (Object Map)
*   *Key*: Edge UUID
    *   **`source`** / **`target`** (string): Node references.
    *   **`sourceHandle`** / **`targetHandle`** (string): Handle IDs.
    *   **`connectionType`** (string)
    *   **`lineType`** (string): `"smoothstep"`, `"step"`, `"straight"`, `"default"`.
    *   **`dashed`** (boolean)
    *   **`animation`** (string): `"none"`, `"forward"`, `"bidirectional"`.
    *   **`arrow`** (boolean)
    *   **`showLabel`** (boolean)
    *   **`waypoints`** (array): `[{x, y}, ...]` manual path points.

---

## 📘 User Interaction Workflow

### 1. Creating Diagrams
- **Place Nodes:** Drag any item from the sidebar palette onto the canvas. A zoom-aware ghost image follows your cursor for precise placement.
- **Connect Nodes:** Hover over a node to reveal connection handles. Click and drag from one handle to another to draw an edge.
- **Edit Labels/Notes:** Double-click a Label or Note node to enter in-place text editing.
    - **Note:** `Enter` inserts a new line.
    - **Submit:** `Ctrl+Enter` (or `Cmd+Enter`) to commit changes.
- **Delete:** Select a node or edge and press `Delete` or `Backspace`.

### 2. Working with Containers
- **Grouping:** Drag infrastructure nodes into a container. If the container is `unlocked`, nodes will snap inside.
- **Lock/Unlock:** Right-click a container and select "Toggle Link". 
    - **Locked:** Dragging the container does *not* move its contents.
    - **Unlocked:** Dragging the container moves all contained nodes together.
- **Resizing:** Select the container to reveal resize handles. Drag the corners to adjust dimensions.

### 3. Advanced Context Menu Actions
Right-click any element to access advanced features:
- **Node Context Menu:**
    - **Config:** Trigger custom configuration events.
    - **Edit Style:** Open the Style Editor modal.
    - **Toggle Inactive:** Grayscale node and dash connected edges (useful for offline/pending states).
    - **Swap Node:** Replace the node with a compatible type.
    - **Order:** Bring to front/back (Container nodes only).
- **Edge Context Menu:**
    - **Line Type:** Change routing style (Smooth Step, Step, Straight, Bezier).
    - **Clear Path:** Reset manual waypoint routing to default automatic routing.
    - **Reverse:** Swap source and target endpoints.

### 4. Style Editor
Opened via right-click → Edit Style on any node.
- **Component:** Customize background, border, and sizing.
- **Label/Text:** Customize fonts, colors, and layout.
- **Swatches:** Use the color picker to maintain branding consistency.

---

## 🎨 Visual Behavior

### Visual States
- **Gear Icon:** Accessible on all nodes for configuration. 
- **Inactive State:** Nodes flagged as `inactive` are rendered with `grayscale(100%)` and a subtle 1px blur effect applied to the image area, without affecting the label.
- **Edges:**
    - **Animation:** Edges connected to `inactive` nodes automatically have animations disabled.
    - **Properties:**
        - `animation`: `"none"` | `"forward"` | `"bidirectional"`
        - `dashed`: `boolean`

### Note vs. Label
- **Notes:** Visually distinguished by a yellow 'sticky note' corner marker (top-right).
- **Warnings:** Overflow warning (⚠️) appears when content exceeds bounds during resizing.

---

## 🛠️ Interaction Reference

| Action | Shortcut |
| :--- | :--- |
| **Copy** | `Ctrl+C` / `Cmd+C` |
| **Paste** | `Ctrl+V` / `Cmd+V` |
| **Delete** | `Delete` / `Backspace` |
| **Close Context/Editor** | `Escape` |
| **Submit Text Edit** | `Ctrl+Enter` |

*(Shortcuts are disabled when editing text or if `enabled` prop is false.)*
