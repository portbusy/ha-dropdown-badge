# Dropdown Badge

A native Home Assistant custom badge that shows the state of an entity and opens a dropdown menu when tapped.

![HACS Badge](https://img.shields.io/badge/HACS-Dashboard-orange.svg)

## Features

- Native badge look and feel (36 px height, rounded border, icon + state).
- Works with `select` and `input_select` entities out of the box.
- Supports any entity with a static list of options.
- Configurable custom action with `{{value}}` placeholder for generic entities.
- Light / dark theme aware, uses Home Assistant CSS variables.
- Keyboard navigation and click-outside / Esc to close the menu.
- Visual editor included (`ha-form` based).

## Installation

### HACS

1. Open HACS in your Home Assistant instance.
2. Go to the **Dashboard** section.
3. Click the menu and choose **Custom repositories**.
4. Add this repository URL and select **Dashboard** as category.
5. Install **Dropdown Badge**.
6. Add the resource to your dashboard:

   ```yaml
   url: /hacsfiles/ha-dropdown-badge/dist/dropdown-badge.js
   type: module
   ```

### Manual

1. Copy `dist/dropdown-badge.js` to `<config>/www/`.
2. Register it as a Lovelace resource:

   ```yaml
   url: /local/dropdown-badge.js
   type: module
   ```

## Configuration

```yaml
type: custom:dropdown-badge
entity: select.living_room_mode
name: Mode
show_name: true
show_state: true
```

### Options

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `entity` | string | **required** | Entity ID to display and control. |
| `name` | string | friendly name | Override the displayed name. |
| `icon` | string | entity icon | Override the icon. |
| `color` | string | state color | Custom color name or CSS value. |
| `show_name` | boolean | `false` | Show the entity name. |
| `show_state` | boolean | `true` | Show the entity state. |
| `options` | list | entity options | Static options for entities that do not expose `options`. |
| `action` | map | auto for select/input_select | Custom service call with `{{value}}` placeholder. |
| `allow_any_entity` | boolean | `false` | Allow the entity picker to select any entity when using static options. |

### Static options for a generic sensor

```yaml
type: custom:dropdown-badge
entity: sensor.fan_speed_preset
name: Speed
show_state: true
options:
  - label: Low
    value: "33"
    icon: mdi:fan-speed-1
  - label: Medium
    value: "66"
    icon: mdi:fan-speed-2
  - label: High
    value: "100"
    icon: mdi:fan-speed-3
action:
  service: fan.set_percentage
  data:
    percentage: "{{value}}"
    entity_id: fan.bedroom
```

## Development

```bash
npm install
npm test
npm run build
```

The built file is committed to `dist/dropdown-badge.js` so HACS can serve it directly.

## License

MIT
