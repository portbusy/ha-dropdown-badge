# Dropdown Badge

A native Home Assistant custom badge that shows the state of a `select` or `input_select` entity and opens a dropdown menu when tapped.

![HACS Badge](https://img.shields.io/badge/HACS-Dashboard-orange.svg)

## Features

- Native badge look and feel (rounded border, card background/border/shadow variables, icon + state).
- Works with `select` and `input_select` entities out of the box.
- Options are read from the entity's `options` attribute.
- Light / dark theme aware, uses Home Assistant CSS variables.
- Keyboard navigation and click-outside / Esc to close the menu.
- Standard Home Assistant interactions: `tap_action`, `hold_action`, `double_tap_action`.
- Choose which interaction opens the dropdown menu (`tap`, `hold`, `double_tap`).
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
| `entity` | string | **required** | Entity ID to display and control. Only `select` and `input_select` are supported. |
| `name` | string | friendly name | Override the displayed name. |
| `icon` | string | entity icon | Override the icon. |
| `color` | string | state color | Custom color name or CSS value. Applied only when the entity is active. |
| `show_name` | boolean | `false` | Show the entity name. |
| `show_state` | boolean | `true` | Show the entity state. |
| `dropdown_on` | string | `tap` | Interaction that opens the dropdown: `tap`, `hold`, `double_tap`. |
| `tap_action` | map | none | Standard Home Assistant tap action. If `dropdown_on` is not `tap`, defaults to `more-info`. |
| `hold_action` | map | none | Standard Home Assistant hold action. |
| `double_tap_action` | map | none | Standard Home Assistant double tap action. |

### Example with hold action

```yaml
type: custom:dropdown-badge
entity: input_select.scene
name: Scene
show_name: true
show_state: true
dropdown_on: hold
hold_action:
  action: more-info
```

### Example with custom tap action

```yaml
type: custom:dropdown-badge
entity: select.living_room_mode
name: Mode
dropdown_on: hold
tap_action:
  action: navigate
  navigation_path: /lovelace/living-room
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
