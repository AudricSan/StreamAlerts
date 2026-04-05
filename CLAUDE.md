# CLAUDE.md

This file provides guidance to Claude Code when working inside the StreamAlerts repository.

## Project Overview

StreamAlerts is a fully local Twitch overlay system designed for OBS Studio.

No external backend, framework, build step, bundler, npm dependency, or cloud service is required.

Main flow:

```text
Twitch → Streamer.bot → JSON files / WebSocket → Overlay → OBS Browser Source
```

The overlay is served locally by XAMPP:

* Overlay URL: `http://localhost/StreamAlerts/overlay/`
* Config panel URL: `http://localhost/StreamAlerts/config/`
* Main dashboard URL: `http://localhost/StreamAlerts/`

---

## Technical Constraints

* Vanilla HTML / CSS / JavaScript only
* No ES modules (`import` / `export`)
* No bundler
* No PHP
* No npm packages
* No JavaScript Vanilla / Vue / framework
* Global classes exposed through `window.*`
* Must remain compatible with OBS Chromium engine (Chromium 90+)
* Avoid unsupported syntax such as:

  * `??=`
  * `structuredClone()`
  * decorators
  * top-level await
  * private class fields (`#field`)

Always favor broad compatibility and defensive coding.

---

## Repository Structure

```text
StreamAlerts/
├── index.html
├── README.md
├── CLAUDE.md
├── config/
├── streamerbot/
└── overlay/
```

### `config/`

Contains the OBS dock configuration UI.

* `index.html` → config UI
* `api.php` → reads/writes JSON files

### `streamerbot/`

Contains C# scripts to paste into Streamer.bot.

Each script writes JSON files into:

```text
overlay/data/
```

These scripts may contain hardcoded absolute Windows paths.

### `overlay/`

Contains the full OBS overlay.

```text
overlay/
├── index.html
├── style.css
├── script.js
├── core/
├── services/
├── utils/
├── components/
├── dev/
├── assets/
└── data/
```

---

## Overlay Boot Sequence

Script loading order in `overlay/index.html` is critical.

Always preserve this order:

```text
core/ → utils/ → services/ → components/ → dev/ → script.js
```

Reason:

* `window.Log`, `window.Bus`, `window.Config`, `window.Store` must exist before components initialize
* components depend on `BaseComponent`
* debug tools depend on all other globals
* `script.js` is the final bootstrap layer

Never move `script.js` before the other scripts.

---

## Core Globals

The project relies on globally exposed singletons.

### `window.Log`

Defined in `core/logger.js`.

Use:

```js
Log.debug('chat', 'message received');
Log.info('poller', 'registered', id);
Log.warn('ws', 'connection lost');
Log.error('alerts', err);
```

Rules:

* Prefer `Log.info/warn/error/debug` over `console.log`
* `debug` logs should only be visible when `?debug=1` is enabled
* Never leave raw `console.log()` calls in production code

### `window.Bus`

Defined in `core/event-bus.js`.

Global pub/sub event system.

Common events:

```text
config:loaded
component:ready
ws:connected
ws:disconnected
ws:message
chat:message
chat:clear
visibility:cmd
visibility:changed
log:entry
```

### `window.Store`

Shared runtime state.

Use for temporary state only.

Do not use Store as a replacement for JSON persistence.

### `window.Config`

Loads `overlay/data/config.json` merged with defaults.

Use:

```js
Config.get('chat.maxMessages');
Config.isEnabled('goal');
```

### `window.Poller`

Centralized polling manager.

All JSON polling must go through Poller.

Never create ad hoc `setInterval()` loops inside components unless absolutely necessary.

### `window.WSManager`

Single WebSocket connection to Streamer.bot.

Responsibilities:

* connect
* authenticate
* subscribe
* reconnect
* emit bus events

### `window.Visibility`

Handles visibility state and `!show` / `!hide` / `!toggle` commands.

---

## Component Pattern

Every overlay widget must extend `BaseComponent`.

Example:

```js
class ExampleWidget extends BaseComponent {
  constructor() {
    super({
      name: 'example',
      zoneId: 'zone-example',
      dataFile: 'example.json',
      pollInterval: 2000,
      testKey: 'x'
    });
  }

  setup(cfg) {
    // optional initialization
  }

  onData(data) {
    // update DOM here
  }

  test() {
    // optional fake test data
  }
}

window.ExampleWidget = new ExampleWidget();
```

### Required Rules

* Always call `super()` in the constructor
* Always expose the instance globally through `window.*`
* Every component must have a unique `name`
* Every component must have a unique DOM zone ID
* Every component must safely handle missing or invalid JSON
* Every component should fail gracefully without breaking the rest of the overlay

---

## Creating a New Component

When creating a new overlay component:

1. Create a new file in `overlay/components/`
2. Extend `BaseComponent`
3. Expose the instance via `window.MyComponent`
4. Add the script include in `overlay/index.html`
5. Add the component entry in `COMPONENTS` inside `script.js`
6. Add the zone definition in `ZONE_DEFS`
7. Add default configuration in `config-manager.js`
8. Add visibility support if needed
9. Add a keyboard test shortcut in `keyboard-tester.js`
10. Add corresponding JSON file support in `overlay/data/`
11. Add documentation in `README.md`

---

## JSON Rules

All JSON files written by Streamer.bot must contain:

```json
{
  "timestamp": 1710000000000
}
```

Rules:

* `timestamp` is required
* must be Unix milliseconds
* Poller uses timestamp-based deduplication
* if timestamp does not change, component updates will be ignored
* invalid JSON should never crash the overlay
* always wrap parsing in `try/catch`

Recommended pattern:

```js
try {
  var data = JSON.parse(text);
} catch (err) {
  Log.error('component-name', err);
  return;
}
```

---

## Security Rules

User-generated content comes from Twitch chat, usernames, donations, predictions, poll titles, etc.

Treat all incoming data as unsafe.

### XSS Protection

Always escape user content before inserting it into the DOM.

Use:

```js
esc(username)
esc(message)
esc(title)
```

Never do:

```js
element.innerHTML = data.message;
```

Only use `innerHTML` with already escaped content.

Preferred safer pattern:

```js
element.textContent = data.message;
```

### Never Trust

* Twitch usernames
* chat messages
* donation messages
* poll labels
* prediction titles
* song titles
* queue usernames

---

## DOM and Rendering Rules

OBS Browser Sources are performance-sensitive.

### Prefer

* `transform`
* `opacity`
* CSS transitions
* lightweight DOM updates
* reusing existing DOM nodes

### Avoid

* large `box-shadow`
* excessive `filter: blur()`
* frequent layout thrashing
* rebuilding entire HTML trees every poll
* unnecessary timers
* animating width/height/top/left when transform is possible

### Good Pattern

```js
element.style.transform = 'translateY(0px)';
element.style.opacity = '1';
```

### Avoid

```js
element.style.top = '300px';
element.style.left = '500px';
```

for repeated animations.

---

## Polling Rules

All polling must be centralized.

Use:

```js
Poller.register({
  id: 'goal',
  file: 'goal.json',
  interval: 2000,
  onData: function(data) {
    // ...
  }
});
```

Rules:

* First fetch should happen immediately
* Avoid polling intervals under 500ms
* Chat should use WebSocket first, polling only as fallback
* Never create duplicate pollers for the same file

---

## WebSocket Rules

The WebSocket connection is the preferred real-time source.

Expected flow:

```text
Connect → Hello → Authenticate → Subscribe → Receive Events
```

Rules:

* Reconnect automatically after disconnect
* Use exponential or fixed reconnect delay
* Never spam reconnection attempts
* Emit status changes through Bus
* Keep WebSocket logic inside `websocket-manager.js`
* Components should not open their own WebSocket connections

---

## Visibility Rules

Visibility is controlled by:

* `overlay/data/visibility.json`
* chat commands
* config panel

If a component has:

```json
"enabled": false
```

inside `config.json`, it is permanently disabled and cannot be shown via chat commands.

Components must respect both:

* config enabled state
* runtime visibility state

---

## Naming Conventions

### Files

Use kebab-case:

```text
last-follower.js
websocket-manager.js
visibility-manager.js
```

### Classes

Use PascalCase:

```js
class LastFollower extends BaseComponent {}
class WebSocketManager {}
```

### Globals

Use PascalCase on `window.*`:

```js
window.LastFollower
window.WSManager
window.Visibility
```

### Config Keys

Use camelCase:

```json
{
  "lastFollower": {},
  "lastSubscriber": {},
  "maxMessages": 20
}
```

---

## Debug Mode

Debug mode is enabled via:

```text
?debug=1
```

Example:

```text
http://localhost/StreamAlerts/overlay/?debug=1
```

When debug mode is active:

* show debug panel
* enable debug logs
* show active pollers
* show websocket state
* show component initialization status

Debug mode should never affect production behavior.

---

## Before Finishing Any Task

Always verify:

1. No raw `console.log()` remains
2. No unsafe `innerHTML` with unescaped user data
3. No duplicate polling loops
4. Component still works if JSON file is missing
5. Component still works if JSON is malformed
6. Component still works if WebSocket disconnects
7. Code is compatible with Chromium 90
8. New files are referenced in `index.html`
9. New config keys have defaults
10. README and CLAUDE.md stay consistent

---

## Typical Mistakes To Avoid

* Forgetting to expose a component via `window.*`
* Forgetting to add the component to `script.js`
* Using unsupported modern JS syntax
* Using `innerHTML` with Twitch data
* Creating independent `setInterval()` loops
* Forgetting `timestamp` in JSON
* Breaking load order in `index.html`
* Hardcoding dimensions without respecting config
* Rebuilding large DOM trees every second
* Not handling WebSocket disconnects
* Forgetting to keep OBS performance in mind