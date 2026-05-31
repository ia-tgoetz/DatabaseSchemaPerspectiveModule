---
name: reactflow-validator
description: Unified validation and security audit tool for ReactFlow Perspective modules. Automates vulnerability scanning, build/deploy orchestration, and runtime validation.
---

# ReactFlow Validator (Ignition 8.3+)

Expert orchestration and security audit tool for ReactFlow Perspective custom modules.

## Workflow

### 1. Security Audit
Run a comprehensive vulnerability scan across Yarn/Gradle dependencies:
```powershell
pwsh .skills/reactflow-validator/scripts/scan.ps1
```
*Review the output against the "Core Analysis Vectors" below.*

### 2. Build & Deployment
Execute the complete module development loop:
```powershell
pwsh .skills/reactflow-validator/scripts/test.ps1
```

### 3. Automated Analysis
Once the gateway is `RUNNING`:
1. Use Playwright to scaffold component state (ISA-95 structure).
2. Perform performance tracing (`performance_start_trace`).
3. Audit components (`lighthouse_audit`).
4. Validate edge orthogonality and handle integrity.

---

## Core Analysis Vectors (Security)
*All findings must include a direct URL link (OSV, CWE, NVD).*

1. **Supply Chain**: Cross-reference dependencies against OSV.dev and Socket.dev.
2. **Property Sync/Prototype Pollution**: Validate XYFlow state mapping to Perspective properties.
3. **DOM Injection (ReactFlow)**: Ensure all custom labels/nodes are sanitized (Use `extractSvgMarkup`).
4. **Gateway Message Handlers**: Audit callbacks for strict payload validation and RBAC.

---

## ReactFlow & Ignition Best Practices

### ReactFlow in Perspective
- **State Serialization**: ReactFlow state is complex. Only sync necessary data points (nodes/edges) to Perspective properties to avoid memory issues on the Java Gateway.
- **SVG Sanitization**: NEVER render user-provided SVG/HTML nodes without applying the `sanitizeSvg` utility.
- **Frontend Registration**: The file `web/packages/client/typescript/perspective-client.ts` is the critical entry point for frontend component registration and prop wiring. This file **MUST** be updated whenever new components are added or property structures change to ensure proper synchronization with the Java backend.

### Ignition 8.3 SDK
- **Component Registry**: Always use `ComponentDescriptorImpl` and register in `GatewayHook`.
- **Message Handlers**: Perspective 8.3 uses WebSockets. Custom component callbacks are frontend-side; ensure any downstream Gateway actions are wrapped in server-side role checks.
- **REST/Web UI**: Avoid deprecated Wicket patterns. Use the modern Perspective SDK Web UI approach.

### Link Validation Protocol
- CVE format: `CVE-\d{4}-\d{4,7}`
- If lacking a specific CVE, link to the relevant CWE or vendor guide.
