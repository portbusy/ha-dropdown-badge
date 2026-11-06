import { describe, it, expect, beforeAll } from 'vitest';

beforeAll(() => {
  customElements.define(
    'ha-form',
    class extends HTMLElement {
      set hass(value) {
        this._hass = value;
      }
      get hass() {
        return this._hass;
      }
      set data(value) {
        this._data = value;
      }
      get data() {
        return this._data;
      }
      set schema(value) {
        this._schema = value;
      }
      get schema() {
        return this._schema;
      }
      set computeLabel(fn) {
        this._computeLabel = fn;
      }
      get computeLabel() {
        return this._computeLabel;
      }
    }
  );
});

const flush = () => new Promise((resolve) => requestAnimationFrame(resolve));

describe('DropdownBadgeEditor', () => {
  it('keeps the same ha-form instance across consecutive hass updates', async () => {
    const { default: DropdownBadgeEditor } = await import(
      '../src/dropdown-badge-editor.js'
    );
    const editor = document.createElement('dropdown-badge-editor');
    editor.setConfig({ entity: 'select.mode' });
    editor.hass = { states: {} };
    document.body.appendChild(editor);
    await flush();

    const form = editor.shadowRoot.querySelector('ha-form');
    expect(form).not.toBeNull();

    editor.hass = {
      states: {
        'select.mode': {
          entity_id: 'select.mode',
          state: 'eco',
          attributes: { friendly_name: 'Mode' },
        },
      },
    };
    await flush();

    expect(editor.shadowRoot.querySelector('ha-form')).toBe(form);
    expect(form.hass.states['select.mode'].state).toBe('eco');

    editor.remove();
  });

  it('filters the entity picker to selectable domains', async () => {
    const { default: DropdownBadgeEditor } = await import(
      '../src/dropdown-badge-editor.js'
    );
    const editor = document.createElement('dropdown-badge-editor');
    editor.setConfig({ entity: 'select.mode' });
    editor.hass = { states: {} };
    document.body.appendChild(editor);
    await flush();

    const form = editor.shadowRoot.querySelector('ha-form');
    const entitySchema = form.schema.find((s) => s.name === 'entity');
    expect(entitySchema.selector.entity.domain).toEqual([
      'select',
      'input_select',
    ]);

    editor.remove();
  });

  it('exposes dropdown_on and action selectors', async () => {
    const { default: DropdownBadgeEditor } = await import(
      '../src/dropdown-badge-editor.js'
    );
    const editor = document.createElement('dropdown-badge-editor');
    editor.setConfig({ entity: 'select.mode' });
    editor.hass = { states: {} };
    document.body.appendChild(editor);
    await flush();

    const form = editor.shadowRoot.querySelector('ha-form');
    const names = form.schema.map((s) => s.name);
    expect(names).toContain('dropdown_on');
    expect(names).toContain('tap_action');
    expect(names).toContain('hold_action');
    expect(names).toContain('double_tap_action');
    expect(names).not.toContain('allow_any_entity');

    editor.remove();
  });
});
