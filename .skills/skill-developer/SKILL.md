# Skill: Skill Developer
Expert agent for creating, refining, and managing modular skills within the `.skills/` directory.

## Goal
To facilitate the creation of reusable, composable, and self-improving units of work (skills) that enhance the capabilities of both Gemini and Claude agents within this project.

## Methodology
Based on the modular skill architecture:
1.  **Instructions (`SKILL.md`):** Expert procedural guidance, rules, and workflows.
2.  **Available Resources:** Tools, scripts, or documentation co-located with the skill.
3.  **Metadata:** Context for when and how to activate the skill.

## Workflow for Creating a New Skill

### 1. Discovery & Definition
- **Inquiry:** Ask the user what specific capability they want to automate or formalize.
- **Scope:** Define the boundaries of the skill. Keep it modular and domain-specific.
- **Drafting:** Create a name for the skill (e.g., `ignition-test-runner`, `react-component-generator`).

### 2. Strategy & Architecture
- **Instructions:** Draft the `SKILL.md` following the "Brain" pattern: Goal, Core Mandates, Workflow, and Operational Patterns.
- **Resources:** Identify if any shell scripts, Python utilities, or reference documents are needed.
- **Cross-Compatibility:** Ensure instructions are clear for both Gemini and Claude.

### 3. Execution (Implementation)
- **Folder Creation:** `mkdir .skills/<skill-name>`
- **Instruction File:** `write_file` `.skills/<skill-name>/SKILL.md`
- **Resource Creation:** Create any identified scripts or resource files in the same folder.
- **Permissions:** Ensure any created scripts are executable (if applicable).

### 4. Integration
- **Registry Update:** Update the root `SKILLS.md` (if it exists) or the local `GEMINI.md`/`CLAUDE.md` to reference the new skill.
- **Activation Guidance:** Provide the user with a snippet of how to activate/use the skill.

### 5. Iterative Refinement
- **Observe:** After the skill is used, check if the agent struggled.
- **Improve:** Update the `SKILL.md` or add resources to address the struggle.

## Standard Skill Template
Each new skill should follow this basic structure in its `SKILL.md`:
```markdown
# Skill: [Name]
[Brief description of the skill's expertise]

## Goal
[What the skill aims to achieve]

## Core Mandates
- [Mandate 1]
- [Mandate 2]

## Workflow
1. [Step 1]
2. [Step 2]

## Operational Patterns / Best Practices
- [Pattern 1]
- [Pattern 2]

## Available Resources
- `setup_skill.ps1`: PowerShell script to initialize a new skill directory and template.
```

## Mandates for the Skill Developer
- **Modularity:** Always prefer small, focused skills over large, complex ones.
- **Co-location:** Keep all logic (scripts) inside the skill's directory.
- **Persistence:** Ensure all improvements are written back to the `SKILL.md` file.
