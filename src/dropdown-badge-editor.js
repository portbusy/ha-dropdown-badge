const EDITOR_STYLE = `
  :host {
    display: block;
  }
  .editor {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  label {
    font-weight: 500;
  }
  textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid var(--divider-color, #ccc);
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color, #000);
    font-family: monospace;
    font-size: 13px;
  }
  .hint {
    font-size: 12px;
    opacity: 0.7;
  }
`;

function stableJsonStringify(value) {
  if (value === undefined || value === null) return '';
  return JSON.stringify(value, null, 2);
}

class DropdownBadgeEditor extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._hass = undefined;
    this._lovelace = undefined;
    this._form = undefined;
    this._optionsTextarea = undefined;
    this._actionTextarea = undefined;
    this._schemaAllowAny = undefined;
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>${EDITOR_STYLE}</style><div class="editor"></div>`;
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  get hass() {
    return this._hass;
  }

  set lovelace(lovelace) {
    this._lovelace = lovelace;
  }

  get lovelace() {
    return this._lovelace;
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  _dispatchChange(config) {
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config },
        bubbles: true,
        composed: true,
      })
    );
  }

  _valueChanged(ev) {
    const config = { ...this._config, ...ev.detail.value };
    this._dispatchChange(config);
  }

  _optionsChanged(ev) {
    try {
      const options = ev.target.value ? JSON.parse(ev.target.value) : undefined;
      this._dispatchChange({ ...this._config, options });
      ev.target.style.borderColor = '';
    } catch {
      ev.target.style.borderColor = 'var(--error-color, red)';
    }
  }

  _actionChanged(ev) {
    try {
      const action = ev.target.value ? JSON.parse(ev.target.value) : undefined;
      this._dispatchChange({ ...this._config, action });
      ev.target.style.borderColor = '';
    } catch {
      ev.target.style.borderColor = 'var(--error-color, red)';
    }
  }

  _computeSchema(allowAnyEntity) {
    const entitySelector = allowAnyEntity
      ? { entity: {} }
      : { entity: { domain: ['select', 'input_select'] } };
    return [
      { name: 'allow_any_entity', selector: { boolean: {} } },
      { name: 'entity', required: true, selector: entitySelector },
      { name: 'name', selector: { text: {} } },
      { name: 'icon', selector: { icon: {} } },
      { name: 'color', selector: { text: {} } },
      { name: 'show_name', selector: { boolean: {} } },
      { name: 'show_state', selector: { boolean: {} } },
    ];
  }

  _ensureEditor() {
    if (this._form) return;

    const editor = this.shadowRoot.querySelector('.editor');

    const form = document.createElement('ha-form');
    this._form = form;
    form.hass = this._hass;
    form.data = this._config;
    this._schemaAllowAny = Boolean(this._config.allow_any_entity);
    form.schema = this._computeSchema(this._schemaAllowAny);
    form.computeLabel = (schemaItem) => {
      if (schemaItem.name === 'allow_any_entity') {
        return 'Allow any entity (static options)';
      }
      return schemaItem.name
        .replace(/_/g, ' ')
        .replace(/^\w/, (c) => c.toUpperCase());
    };
    form.addEventListener('value-changed', this._valueChanged.bind(this));
    editor.appendChild(form);

    const optionsField = document.createElement('div');
    optionsField.className = 'field';
    optionsField.innerHTML = `
      <label>Static options (JSON)</label>
      <textarea rows="4" placeholder='[{"label":"On","value":"on","icon":"mdi:lightbulb"}]'></textarea>
      <span class="hint">Used when the entity has no options attribute.</span>
    `;
    this._optionsTextarea = optionsField.querySelector('textarea');
    this._optionsTextarea.value = stableJsonStringify(this._config.options);
    this._optionsTextarea.addEventListener('change', this._optionsChanged.bind(this));
    editor.appendChild(optionsField);

    const actionField = document.createElement('div');
    actionField.className = 'field';
    actionField.innerHTML = `
      <label>Custom action (JSON)</label>
      <textarea rows="4" placeholder='{"service":"light.turn_on","data":{"brightness":"{{value}}"}}'></textarea>
      <span class="hint">Use {{value}} as placeholder for the selected option.</span>
    `;
    this._actionTextarea = actionField.querySelector('textarea');
    this._actionTextarea.value = stableJsonStringify(this._config.action);
    this._actionTextarea.addEventListener('change', this._actionChanged.bind(this));
    editor.appendChild(actionField);
  }

  _updateTextarea(textarea, value) {
    if (!textarea) return;
    if (document.activeElement === textarea) return;
    const next = stableJsonStringify(value);
    if (textarea.value === next) return;
    textarea.value = next;
    textarea.style.borderColor = '';
  }

  _render() {
    this._ensureEditor();

    this._form.hass = this._hass;
    this._form.data = this._config;

    const allowAny = Boolean(this._config.allow_any_entity);
    if (allowAny !== this._schemaAllowAny) {
      this._schemaAllowAny = allowAny;
      this._form.schema = this._computeSchema(allowAny);
    }

    this._updateTextarea(this._optionsTextarea, this._config.options);
    this._updateTextarea(this._actionTextarea, this._config.action);
  }
}

customElements.define('dropdown-badge-editor', DropdownBadgeEditor);

export default DropdownBadgeEditor;