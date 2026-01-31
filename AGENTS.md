# AGENTS.md - Operational Guide for AI Agents

This document defines the protocols, commands, and style guidelines for AI agents working in the `gcli2api` repository.

## 1. Environment & Build

- **Runtime**: Python 3.12+
- **Dependency Management**: `pip` with `requirements.txt` / `requirements-dev.txt`
- **Configuration**: `pyproject.toml` (tools), `config.py` (runtime application config)

### Common Commands

| Action | Command | Notes |
|--------|---------|-------|
| **Install** | `pip install -r requirements.txt` | Prod dependencies |
| **Install Dev** | `pip install -r requirements-dev.txt` | Dev dependencies (test, lint) |
| **Run Server** | `python web.py` | Starts FastAPI server |
| **Test (All)** | `python -m pytest -v` | Runs all tests |
| **Test (Single)**| `python -m pytest tests/path/to/test.py::test_function` | Target specific test |
| **Lint** | `flake8 src/ web.py` | Check style enforcement |
| **Type Check** | `mypy src/` | Static type analysis |
| **Format** | `black src/ web.py` | Auto-format code |

## 2. Code Style & Conventions

**Strictly follow these patterns to maintain codebase consistency.**

### Formatting & Syntax
- **Formatter**: `black` is the authority. Line length is **100**.
- **Imports**: Sorted by `isort` (Standard Lib -> Third Party -> Local Application).
- **Async/Await**: Use `async`/`await` for all I/O bound operations (DB, API calls).
- **Typing**:
  - Use `typing` module (`List`, `Dict`, `Optional`, `Union`, `Any`).
  - **Pydantic**: Heavily used for data validation and API schemas (`src/models.py`).
  - **Return Types**: Explicitly declare return types for all functions.

### Naming Conventions
- **Variables/Functions**: `snake_case` (e.g., `get_config_value`, `user_session`)
- **Classes/Models**: `PascalCase` (e.g., `AuthCallbackRequest`, `GeminiGenerationConfig`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `AUTO_BAN_ERROR_CODES`)
- **Private**: `_leading_underscore` (e.g., `_get_cached_config`)

### Error Handling & Logging
- **Logging**: Use the project's logger, NOT `print`.
  ```python
  from log import log
  log.info("Processing started")
  log.error(f"Failed to process: {e}")
  ```
- **API Errors**: In routes, catch exceptions and raise `HTTPException`.
  ```python
  from fastapi import HTTPException
  try:
      ...
  except Exception as e:
      log.error(f"Error: {e}")
      raise HTTPException(status_code=500, detail=str(e))
  ```

### Configuration Pattern
- Do NOT hardcode values. Use `config.py`.
- Pattern: `value = await get_config_value("key_name", default_value)`
- Environment variables override database config.

## 3. Modular Isolation Strategy (CRITICAL)

**When adding new features that modify shared logic or upstream files, you MUST follow the Isolation Strategy to minimize conflicts.**

### Core Principle
- **Decouple**: Isolate custom logic into dedicated files rather than modifying shared upstream files.
- **Hook**: Use minimal changes in shared files to invoke your isolated modules.

### Implementation Guide
1. **Backend Route Isolation**:
   - Create a new file (e.g., `src/panel/stats.py`) for your new feature's API routes.
   - Register this new router in `src/panel/__init__.py` or `web.py`.
   - **AVOID** adding unrelated routes to `src/panel/creds.py` or existing large controllers.

2. **Frontend Logic Isolation**:
   - Create a new JS file (e.g., `front/stats.js`) for your feature's logic.
   - Import this script in `front/control_panel.html`.
   - **AVOID** adding large chunks of logic to `front/common.js`.

3. **Conflict Resolution**:
   - If upstream refactors a file you modified, try to migrate your changes to a new isolated file instead of fighting the merge conflict.

## 4. Project Structure Key Points

- `src/panel/`: FastAPI route modules (Modular Design).
- `src/models.py`: Pydantic data models for request/response.
- `src/storage_adapter.py`: Database abstraction layer.
- `src/auth.py`: Authentication logic (OAuth flows).
- `config.py`: Centralized configuration management.
- `front/`: Frontend static files (HTML/JS/CSS).

## 5. Testing Guidelines

- Use `pytest` for all testing.
- Write tests in `tests/` directory (if not present, create it matching `src/` structure).
- Use `pytest-asyncio` for async tests.
- Mock external APIs (Google, Anthropic) using `unittest.mock` or `pytest-mock`.

## 6. Git Workflow

- **Commit Messages**: Conventional Commits (e.g., `feat: isolate stats logic`, `fix: typo in config`).
- **Safety**: Never commit secrets or credentials.
