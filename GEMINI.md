# StreamAlerts - Project Context

StreamAlerts is a fully local Twitch overlay system designed for OBS Studio. It operates without external backends, frameworks, or cloud services, relying on **Streamer.bot**, **XAMPP**, and **OBS Studio**.

## Project Overview

- **Architecture**: `Twitch → Streamer.bot → JSON files / WebSocket → Overlay → OBS Browser Source`.
- **Backend**: C# scripts (`.cs`) executed by Streamer.bot write event data to local JSON files in `overlay/data/`.
- **Frontend**: A vanilla HTML/CSS/JS application served locally via XAMPP.
- **Real-time**: Uses Streamer.bot's WebSocket for chat and instant commands, with JSON polling as a fallback.
- **Configuration**: Managed via `overlay/data/config.json` or a PHP-based web interface in `config/`.

## Technical Constraints

- **Vanilla Only**: No ES modules (`import`/`export`), no bundlers (webpack/vite), no npm dependencies, and no modern frameworks (React/Vue).
- **Compatibility**: Must remain compatible with **OBS Chromium (v90+)**.
- **Forbidden Syntax**: Avoid `??=`, `structuredClone()`, decorators, top-level `await`, and private class fields (`#field`).
- **Global Scope**: Singletons and components are exposed via `window.*`.

## Development Conventions

### Component Pattern
All widgets must extend `BaseComponent` (defined in `overlay/core/base-component.js`).
- **Required Hooks**: `setup(cfg)` for initialization and `onData(data)` for handling JSON updates.
- **Registration**: Instances must be exposed globally (e.g., `window.MyComponent = new MyComponent();`) and registered in `overlay/script.js`.
- **Data Integrity**: JSON files MUST contain a `timestamp` (Unix ms) for deduplication by the `Poller`.

### Security & Safety
- **XSS Protection**: Always escape user-generated content (usernames, messages, etc.) using the `esc()` utility or `textContent`. Never use `innerHTML` with raw data.
- **Graceful Failure**: Components must handle missing or malformed JSON without crashing the entire overlay.

### Global Singletons
- `window.Log`: Centralized logging (`Log.info`, `Log.warn`, `Log.error`, `Log.debug`).
- `window.Bus`: Global event system (`Bus.emit`, `Bus.on`).
- `window.Config`: Access to `config.json` and defaults.
- `window.Poller`: Centralized management of JSON file fetching.
- `window.WSManager`: Single WebSocket connection handler.

## Script Loading Order
The order in `overlay/index.html` is critical and must be preserved:
1. `core/`: Foundation (Log, Bus, Config, BaseComponent).
2. `utils/`: Pure utility functions (DOM escaping, time formatting).
3. `services/`: I/O managers (Poller, WebSocket, Visibility).
4. `dev/`: Debug tools (active if `?debug=1`).
5. `components/`: Business logic and rendering.
6. `script.js`: Final bootstrap.

## Key Commands & URLs

- **Overlay**: `http://localhost/StreamAlerts/overlay/`
- **Config Panel**: `http://localhost/StreamAlerts/config/`
- **Debug Mode**: Append `?debug=1` to the overlay URL.
- **Testing**: Use keyboard shortcuts (defined in `keyboard-tester.js`) in the browser to simulate events (e.g., 'T' for alerts).

## Directory Structure

- `overlay/`: The web application.
  - `core/`: Base classes and singletons.
  - `components/`: Individual widget logic.
  - `data/`: JSON state and configuration.
- `streamerbot/`: C# source code for Streamer.bot actions.
- `config/`: PHP-based configuration UI for OBS Docks.
