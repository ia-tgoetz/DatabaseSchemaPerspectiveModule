# Skill: Ignition Module Lifecycle
Expert agent for managing the build-deploy-restart cycle of custom Ignition Perspective modules.

## Goal
To streamline the development loop for the `reactflow-module` by automating compilation, container management, and gateway validation.

## Core Mandates
- **Always Validate Build:** Ensure Gradle build passes before attempting to restart the gateway.
- **Docker Awareness:** Use the `igntion_test_env` as the primary target for module deployment.
- **Unsigned Tolerance:** Leverage `-Dignition.allowunsignedmodules=true` in the dev environment to bypass signing during rapid prototyping.
- **Gateway Health Checks:** Always verify the gateway reaches `RUNNING` state after a restart.

## Workflow

### 1. The "Fast Loop" (Local Dev)
Use this for quick iterative changes to Java or React code.
1. Run the build command and, ONLY IF IT SUCCEEDS, restart the Gateway:

   **For PowerShell (Windows):**
   ```powershell
   ./gradlew clean build; if ($LASTEXITCODE -eq 0) { ./restartIgnition.ps1 }
   ```

   **For Bash (Linux/macOS):**
   ```bash
   ./gradlew clean build && ./restartIgnition.ps1
   ```
2. The `docker-compose.yml` is configured to mount `../build` to `/usr/local/bin/ignition/external-modules`, so the `.modl` is automatically available once built.

### 2. The "Clean Loop"
Use this if the module isn't loading correctly or if there are caching issues.
1. Run `./gradlew clean build`.
2. Run `docker compose down` and `docker compose up -d` in `igntion_test_env`.
3. Verify logs with `docker logs -f module-dev-ignition`.

### 3. Signing for Distribution
When preparing for a release or testing on a production-like gateway:
1. Ensure `sign.props` is configured correctly.
2. Run `./gradlew signModule`.

## Operational Patterns

### Gradle Commands
- `installModule`: Installs the module to a local Ignition installation.
- `deepClean`: Removes `node_modules` and Gradle caches (use sparingly).

### Docker Management
- Service Name: `module-dev-ignition`
- Context URL: `http://module-dev-ignition.localtest.me:80/system/gwinfo`

## Available Resources
- `reactflow-module/restartIgnition.ps1`: Automated restart and health check script.
- `reactflow-module/igntion_test_env/docker-compose.yml`: Local test environment configuration.
- `reactflow-module/build.gradle.kts`: Build and deployment logic.
