# Ignition React Flow Perspective Components

A custom Ignition Perspective module built with the Perspective Component SDK and [React Flow](https://reactflow.dev/). This module provides the following components for use in Ignition Perspective views:

- **Database Schema** — Interactive visualization of database tables and relationships.
- **Hierarchy Chart** — Tree/hierarchy visualization with Dagre-based auto-layout.
- **JSON Editor** — Embedded JSON editor component.

> **Architecture Builder has moved.**
> The `ArchitectureBuilder` component has been migrated to its own standalone module:
> **[https://github.com/ia-tgoetz/ArchitectureBuilderReactFlow](https://github.com/ia-tgoetz/ArchitectureBuilderReactFlow)**
> Module ID: `com.wargoetz.archBuilder`

---

## 📦 Installation

1. Download the latest `.modl` file from the [Releases] page (or build from source).
2. Navigate to your Ignition Gateway Webpage > **Config** > **Modules**.
3. Click **Install or Upgrade a Module**.
4. Upload the `.modl` file and accept the certificate.
5. Open the Ignition Designer. You will find the components in the Perspective Component Palette under **WARGoetz**.

---

## 🏗️ Building from Source

Requires Java 17, Node.js, and Gradle.

1. Clone the repository.
2. Build the module:
   ```bash
   ./gradlew clean build
   ```
3. The compiled `.modl` file will be in the `build/` directory.

### Fast deploy to local gateway
```bash
./gradlew installModule
```

---

## ⚠️ Designer "Gotchas"

- **Preview Mode required for write-backs:** Test drag/drop and property saves in Preview Mode (the Play button). Standard Design Mode blocks deep property write-backs.
- **Cache after module update:** After installing a new `.modl` while the Designer is open, close the view tab, accept the "Update Available" banner, and reopen the view to clear the cached React component.
