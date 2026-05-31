---
name: git-subrepo-commit
description: Automates the process of committing changes in sub-repositories with a structured branch naming convention ({firstInitialLastName}/{description}). Use this when ready to commit changes to a specific sub-repo or the root repo, ensuring a new branch is created if the current one doesn't match the work being done.
---

# Git Subrepo Commit

## Overview

This skill provides a standardized workflow for committing changes across the Ignition Architecture Ecosystem. It ensures that work is performed on descriptive branches following the `{firstInitialLastName}/{branch-description}` format and automates the `git add` and `git commit` sequence.

## Workflow

When you have completed a set of changes and are ready to commit, follow these steps:

1.  **Identify the Scope**: Determine which sub-repo (or the root repo) you are committing to.
2.  **Formulate Description**: Create a short, slug-friendly description of the changes (e.g., "clear-edge-waypoints").
3.  **Run the Commit Script**: Use the provided PowerShell script to handle the branching and committing.

### Example Usage

To commit changes related to "clearing waypoints" with a specific commit message:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .skills/git-subrepo-commit/scripts/git_commit.ps1 -branchDescription "clear-edge-waypoints" -commitMessage "feat: clear waypoints after edge or node movement"
```

## Guidelines

- **Username Derivation**: The script automatically derives your username from `git config user.name` as `firstInitial + LastName` in all lowercase (e.g., "Thomas Goetz" becomes `tgoetz`).
- **Branch Naming**: The script automatically normalizes the description (lowercase, hyphens).
- **Branch Switching**: If a branch with the same description already exists, the script will switch to it instead of creating a new one.
- **Organized Commits**: The script performs a `git add .` to capture all changes in the current directory. Ensure you are in the correct sub-repo directory before running.

## Resources

### scripts/

- `git_commit.ps1`: The primary automation script for branching and committing.
