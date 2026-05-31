# Project Skills Registry
This directory contains modular skills that enhance the capabilities of AI agents (Gemini and Claude) in this project.

## Active Skills
- [Skill Developer](./skill-developer/SKILL.md) - Expert agent for creating, refining, and managing modular skills.
- [Ignition Test Runner](./ignition-test-runner/SKILL.md) - Orchestrates build, deploy, restart, and automated analysis cycles.
- [Ignition Module Lifecycle](./ignition-module-lifecycle/SKILL.md) - Automates build, deploy, and restart cycles for Ignition modules.
- [Ignition Component Generator](./ignition-component-generator/SKILL.md) - Scaffolds new Perspective components across all layers.
- [ReactFlow Routing Validator](./reactflow-routing-validator/SKILL.md) - Audits and maintains orthogonal edge routing logic.
- [Container Interaction Guard](./container-interaction-guard/SKILL.md) - Expert guidance for managing React Flow node interactivity and preventing drag-blocking regressions.

## How to Use
1. **Gemini:** Use `activate_skill` (for built-in skills) or read the `SKILL.md` file in the skill's directory to adopt the persona and workflow.
2. **Claude:** Read the `SKILL.md` (or `CLAUDE.md` if available) in the skill's directory to adopt the persona and workflow.

## Methodology
Skills are modular, resource-backed, and self-improving. They are stored in `.skills/<skill-name>/` and include:
- `SKILL.md`: Expert instructions.
- Resources: Scripts, tools, and docs co-located with the instructions.
