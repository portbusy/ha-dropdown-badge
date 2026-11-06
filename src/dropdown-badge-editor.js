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

class DropdownBadgeEditor extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._hass = undefined;
    this._lovelace = undefined;
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

  _render() {
    const editor = this.shadowRoot.querySelector('.editor');
    editor.innerHTML = '';

    const form = document.createElement('ha-form');
    form.hass = this._hass;
    form.data = this._config;
    form.schema = [
      { name: 'entity', required: true, selector: { entity: {} } },
      { name: 'name', selector: { text: {} } },
      { name: 'icon', selector: { icon: {} } },
      { name: 'color', selector: { text: {} } },
      { name: 'show_name', selector: { boolean: {} } },
      { name: 'show_state', selector: { boolean: {} } },
    ];
    form.computeLabel = (schemaItem) =>
      schemaItem.name.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
    form.addEventListener('value-changed', this._valueChanged.bind(this));
    editor.appendChild(form);

    const optionsField = document.createElement('div');
    optionsField.className = 'field';
    optionsField.innerHTML = `
      <label>Static options (JSON)</label>
      <textarea rows="4" placeholder='[{"label":"On","value":"on","icon":"mdi:lightbulb"}]'></textarea>
      <span class="hint">Used when the entity has no options attribute.</span>
    `;
    const optionsTextarea = optionsField.querySelector('textarea');
    optionsTextarea.value = this._config.options
      ? JSON.stringify(this._config.options, null, 2)
      : '';
    optionsTextarea.addEventListener('change', this._optionsChanged.bind(this));
    editor.appendChild(optionsField);

    const actionField = document.createElement('div');
    actionField.className = 'field';
    actionField.innerHTML = `
      <label>Custom action (JSON)</label>
      <textarea rows="4" placeholder='{"service":"light.turn_on","data":{"brightness":"{{value}}"}}'></textarea>
      <span class="hint">Use {{value}} as placeholder for the selected option.</span>
    `;
    const actionTextarea = actionField.querySelector('textarea');
    actionTextarea.value = this._config.action
      ? JSON.stringify(this._config.action, null, 2)
      : '';
    actionTextarea.addEventListener('change', this._actionChanged.bind(this));
    editor.appendChild(actionField);
  }
}

customElements.define('dropdown-badge-editor', DropdownBadgeEditor);

export default DropdownBadgeEditor;
