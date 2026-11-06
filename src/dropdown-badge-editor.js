const EDITOR_STYLE = `
  :host {
    display: block;
  }
  .editor {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
`;

const LABELS = {
  entity: 'Entity',
  name: 'Name',
  icon: 'Icon',
  color: 'Color',
  show_name: 'Show name',
  show_state: 'Show state',
  dropdown_on: 'Open dropdown on',
  tap_action: 'Tap action',
  hold_action: 'Hold action',
  double_tap_action: 'Double tap action',
};

class DropdownBadgeEditor extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._hass = undefined;
    this._lovelace = undefined;
    this._form = undefined;
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

  _computeSchema() {
    return [
      { name: 'entity', required: true, selector: { entity: { domain: ['select', 'input_select'] } } },
      { name: 'name', selector: { text: {} } },
      { name: 'icon', selector: { icon: {} } },
      { name: 'color', selector: { ui_color: {} } },
      { name: 'show_name', selector: { boolean: {} } },
      { name: 'show_state', selector: { boolean: {} } },
      {
        name: 'dropdown_on',
        selector: {
          select: {
            mode: 'list',
            options: [
              { label: 'Tap', value: 'tap' },
              { label: 'Hold', value: 'hold' },
              { label: 'Double tap', value: 'double_tap' },
            ],
          },
        },
      },
      { name: 'tap_action', selector: { ui_action: {} } },
      { name: 'hold_action', selector: { ui_action: {} } },
      { name: 'double_tap_action', selector: { ui_action: {} } },
    ];
  }

  _ensureEditor() {
    if (this._form) return;

    const editor = this.shadowRoot.querySelector('.editor');

    const form = document.createElement('ha-form');
    this._form = form;
    form.hass = this._hass;
    form.data = this._config;
    form.schema = this._computeSchema();
    form.computeLabel = (schemaItem) => LABELS[schemaItem.name] || schemaItem.name;
    form.addEventListener('value-changed', this._valueChanged.bind(this));
    editor.appendChild(form);
  }

  _render() {
    this._ensureEditor();

    this._form.hass = this._hass;
    this._form.data = this._config;
  }
}

customElements.define('dropdown-badge-editor', DropdownBadgeEditor);

export default DropdownBadgeEditor;
