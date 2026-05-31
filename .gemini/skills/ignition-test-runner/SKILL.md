---
name: ignition-test-runner
description: Orchestrates build, deploy, restart, and comprehensive automated analysis of the React Flow module using Playwright, DevTools, and routing validation.
---

# Skill: Ignition Test Runner
Expert agent for orchestrating the build, deploy, restart, and comprehensive automated analysis of the React Flow module.

## Goal
To streamline the complete development loop: automated module compilation, local gateway deployment, restart, and post-startup automated performance, functional, and routing analysis. All of this should be done with minimal manual intervention, providing actionable insights and feedback to developers.

## Core Mandates
- **Build First:** Always run `./gradlew clean build` and verify success before proceeding.
- **Restart with Flexibility:** Utilize `./restartIgnition.ps1` for gateway management. Use the `-designer` flag to automatically open the designer after the gateway reaches the `RUNNING` state.
- **Integrated Analysis:** After the gateway is confirmed `RUNNING`, perform automated analysis using the `playwright` and `chrome-devtools` MCP servers, combined with `reactflow-routing-validator` standards.

## Workflow

### 1. Execute Build & Restart
Run the following PowerShell command:
```powershell
./gradlew clean build; if ($LASTEXITCODE -eq 0) { ./restartIgnition.ps1 -designer }
```

### 2. Automated Analysis Phase
Once the gateway is `RUNNING`, execute the following analysis suite:

#### A. Interactive ISA-95 Scaffolding
1.  **Navigate:** Use `mcp_project-chrome-devtools_navigate_page` to access the target component test page.
2.  **Scaffold ISA-95:** Utilize Playwright to perform the following:
    *   Drag and drop nodes from the palette to build a 4-level ISA-95 hierarchy (Enterprise -> Site -> Area -> Process Cell).
    *   Connect nodes using defined `connectionTypes` to establish valid signal/data paths.
    *   Place nodes inside containers to represent functional zones.
3.  **Visual Verification:** The agent should remain in the browser context, allowing the user to observe the automated construction.    

#### B. Interactive & Performance Validation (Playwright/DevTools) (Use http://module-dev-ignition.localtest.me/data/perspective/client/ArchBuilder for testing)
1.  **Performance Trace:** Start a trace (`performance_start_trace`), perform interaction (e.g., drag nodes, pan canvas), and stop the trace (`performance_stop_trace`). Analyze insights.
2.  **Audit:** Run `lighthouse_audit` (accessibility/best practices).
3.  **Error Logging:** Check `list_console_messages` for runtime errors or warnings.

#### C. React Flow Routing Validation (Integrates `reactflow-routing-validator` skill)
1.  **Orthogonality Check:** Verify edge segments are strictly horizontal/vertical.
2.  **Handle Integrity:** Ensure handles are present and correctly anchored (even if invisible).
3.  **Interaction Generosity:** Verify hit areas scale correctly based on zoom.
4.  **Source of Truth:** Confirm `waypoints[]` state matches rendered edge path.

### 3. Reporting & Fix Feedback
- **Compile Feedback:** Aggregate console errors, performance insights, and routing validation failures.
- **Actionable Advice:** Provide specific, technical recommendations to resolve identified issues, mapping them back to the architectural rules in `GEMINI.md`.

## Best Practices
- **Gateway Health:** Do not initiate analysis until `restartIgnition.ps1` confirms the gateway is `RUNNING`.
- **Validation:** Always review console messages after navigation to ensure no critical errors occurred.
- **Actionability:** If a test fails, DO NOT just report the error. Include a suggested fix based on architectural standards.

