# Skill: Container Interaction Guard
Expert guidance for managing React Flow node interactivity, specifically ensuring that nested interior content allows pane panning while maintaining node draggability.

## Goal
To prevent regressions where interior node interactivity (like pane panning) inadvertently blocks node dragging functionality.

## Core Mandates
- **Shell Interactivity:** NEVER apply `pointer-events: none` to the entire node shell (`<div style={combinedStyle}>`). The shell MUST remain interactive to receive drag-and-drop events from React Flow.
- **Interior Isolation:** If interior pane panning is needed, isolate the panning logic (e.g., `nodrag` class, `pointer-events: none`) to an *interior* `div` wrapper, explicitly sized to avoid covering the header/drag handle.
- **Drag Handle Priority:** Ensure header drag handles are absolutely positioned outside the interior panning wrapper, and explicitly set `pointer-events: auto` to guarantee they receive pointer events.

## Workflow
1.  **Analyze Drag Target:** Determine if the node needs a dedicated drag handle (e.g., header).
2.  **Apply Panning Logic:** If pane panning from inside is needed:
    - Create a wrapper `div` for the content area.
    - Add the `nodrag` class to this wrapper.
    - Set the wrapper's `pointer-events: none`.
3.  **Verify Interactivity:** Confirm the header handle (if any) is set to `pointer-events: auto` and remains functional.
4.  **Test:** Drag the header to verify node movement; drag the interior area to verify pane panning.
