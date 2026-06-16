# ArchitectureBuilder Search Features

Two search features were added to the ArchitectureBuilder component. Both are self-contained within the `ArchitectureBuilder/` directory and require no changes to the Ignition schema or Gateway.

---

## 1. Palette Search

**Purpose:** Filter the left-side component palette by name so users can quickly find a draggable item without scrolling through all categories.

### Implementation

**File modified:** `Sidebar.tsx`

| Change | Detail |
|---|---|
| New state | `searchQuery: string` added to `Sidebar` component |
| Filtering | Extended the existing `useMemo` that builds `containerItems` / `groupedItems` — items whose `label` does not match the query (case-insensitive substring) are excluded |
| Auto-expand | When a search query is active, all category sections are force-expanded (`isCollapsed` overridden to `false`) |
| Clear revert | When the query is cleared, categories return to their previous collapsed/expanded state |
| Import reused | `sharedInputStyle` from `constants.ts` used for the input field — no new styles introduced |

**New JSX added to `Sidebar.tsx`:**
- A search `<input>` below the "Palette" heading
- A `×` clear button that appears only when there is text in the input
- A "No components match" message when the query yields zero results

---

## 2. Canvas Node Search ("Fly To")

**Purpose:** Find nodes already placed on the canvas by name or component type, then animate the viewport to center on the selected node.

### Implementation

**New file:** `CanvasSearch.tsx`

A standalone floating overlay component. Accepts:
- `nodes` — the raw nodes dictionary (`props.props.nodes`) passed directly from `ArchitectureBuilder`
- `paletteItems` — used to resolve a human-readable type label from each node's `paletteId`
- `onFlyTo(nodeId, x, y, w, h)` — callback that triggers the viewport animation and selection
- `onClose()` — callback to dismiss the overlay

Search matches against:
- `node.label` (primary — the node's display name)
- `node.paletteId` (component type ID, e.g. `"kafka"`)
- `node.typeId` (secondary type identifier, if set)

All matches are case-insensitive substring.

**File modified:** `ArchitectureBuilder.tsx`

| Change | Detail |
|---|---|
| Import | `CanvasSearch` imported |
| New state | `canvasSearchOpen: boolean` |
| Keyboard handler | `Ctrl+F` / `Cmd+F` toggles the overlay open/closed; added before the INPUT/TEXTAREA guard so it works even when an input has focus |
| Escape | Existing Escape handler extended to also close the canvas search |
| `flyToNode` callback | Calls `reactFlowInstance.fitBounds({ x, y, width, height }, { padding: 0.5, duration: 600 })` to animate the viewport, then calls `setSelectedId(nodeId)` to select the node and closes the overlay |
| Render | `<CanvasSearch>` conditionally rendered inside the `<div role="main">` wrapper, alongside `StyleEditorModal` and `ContextMenu` |

---

## User Guide

### Palette Search

1. Open the left sidebar (click `▶` if it is collapsed).
2. Type in the **"Search palette..."** box at the top of the palette.
3. All items whose name does not contain the search text are hidden. Categories auto-expand to show matches.
4. Click the **×** button or clear the text to restore the full palette.
5. Drag any visible result onto the canvas as normal.

**Example:** Typing `kafka` hides every item except the Kafka component.

---

### Canvas Node Search (Fly To)

1. Press **`Ctrl+F`** (or `Cmd+F` on Mac) anywhere on the canvas.  
   A floating search bar appears centered at the top of the canvas.

2. Start typing — a dropdown of matching nodes appears immediately below the input.  
   Each result shows the **node label** and a **type tag** (e.g. `[Zone]`, `[Kafka]`).

3. Navigate and select a result using any of these methods:

   | Action | Result |
   |---|---|
   | **Click** a result | Flies to that node |
   | **↑ / ↓ arrow keys** | Move the highlight up/down |
   | **Enter** | Select the highlighted result |
   | **Escape** | Close without selecting |
   | **×** button | Clear the query (overlay stays open) |
   | **Ctrl+F** again | Toggle the overlay closed |

4. On selection the viewport **smoothly animates** (600 ms) to frame the node with padding, and the node becomes **selected** (blue outline).

**Examples:**
- `Machine 12B` → centers on the node named "Machine 12B"
- `kafka` → lists every node whose label or type contains "kafka"
- `zone` → lists all Zone/Area container nodes

---

## Files Changed

| File | Change |
|---|---|
| `Sidebar.tsx` | Added palette search input, filter logic, clear button, empty-state message |
| `CanvasSearch.tsx` | **New file** — floating canvas search overlay |
| `ArchitectureBuilder.tsx` | Added `canvasSearchOpen` state, `Ctrl+F` handler, `flyToNode` callback, `<CanvasSearch>` render |

No changes to:
- `architecturebuilder.props.json` (no new props needed)
- `perspective-client.ts` (no new props to wire)
- Any Java/Gateway/Designer scope files
