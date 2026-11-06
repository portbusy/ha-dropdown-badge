import { resolveOptions, buildServiceCall } from './utils.js';

const BADGE_STYLE = `
  :host {
    display: inline-flex;
    position: relative;
    vertical-align: middle;
  }
  .badge {
    height: 36px;
    min-width: 36px;
    border-radius: 18px;
    padding: 0 12px;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background-color: var(--badge-color, var(--state-inactive-color, #a0a0a0));
    color: var(--text-badge-color, var(--primary-text-color, #fff));
    font-family: var(--paper-font-body1_-_font-family, inherit);
    font-size: 14px;
    cursor: pointer;
    user-select: none;
    transition: box-shadow 0.2s ease;
    outline: none;
  }
  .badge:focus-visible {
    box-shadow: 0 0 0 2px var(--badge-color), 0 0 0 4px var(--state-active-color, #000);
  }
  .badge.error {
    --badge-color: var(--error-color, #db4437);
  }
  .content {
    display: flex;
    align-items: baseline;
    gap: 6px;
    line-height: 1;
  }
  .name {
    font-weight: 500;
  }
  .state {
    opacity: 0.9;
  }
  .arrow {
    opacity: 0.8;
    width: 18px;
    height: 18px;
  }
  .menu {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    z-index: 1000;
    min-width: 160px;
    max-width: 280px;
    max-height: 300px;
    overflow-y: auto;
    background: var(--card-background-color, var(--secondary-background-color, #fff));
    color: var(--primary-text-color, #000);
    border-radius: 8px;
    box-shadow: var(--shadow-elevation-8dp, 0 4px 12px rgba(0,0,0,0.2));
    padding: 4px 0;
    display: flex;
    flex-direction: column;
  }
  .option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: transparent;
    border: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    outline: none;
  }
  .option:focus-visible,
  .option:hover {
    background: var(--secondary-background-color, rgba(0,0,0,0.05));
  }
`;

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

class DropdownBadge extends HTMLElement {
  constructor() {
    super();
    this._config = undefined;
    this._hass = undefined;
    this._open = false;
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>${BADGE_STYLE}</style><div class="badge"></div>`;

    this._boundToggle = this._toggleMenu.bind(this);
    this._boundClose = this._closeOnOutside.bind(this);
    this._boundKey = this._handleKey.bind(this);
  }

  connectedCallback() {
    this.shadowRoot.querySelector('.badge').addEventListener('click', this._boundToggle);
    document.addEventListener('click', this._boundClose);
    this.addEventListener('keydown', this._boundKey);
  }

  disconnectedCallback() {
    this.shadowRoot.querySelector('.badge').removeEventListener('click', this._boundToggle);
    document.removeEventListener('click', this._boundClose);
    this.removeEventListener('keydown', this._boundKey);
  }

  static async getConfigElement() {
    await import('./dropdown-badge-editor.js');
    return document.createElement('dropdown-badge-editor');
  }

  static getStubConfig(hass, entities) {
    const found =
      entities?.find(
        (e) => e.startsWith('select.') || e.startsWith('input_select.')
      ) || '';
    return {
      entity: found,
      show_state: true,
      show_name: false,
    };
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  get hass() {
    return this._hass;
  }

  setConfig(config) {
    if (!config || !config.entity) {
      throw new Error('Entity is required');
    }
    this._config = {
      show_state: true,
      show_name: false,
      ...config,
    };
    this._render();
  }

  _formatState(stateObj) {
    if (this._hass?.formatEntityState) {
      return this._hass.formatEntityState(stateObj);
    }
    return stateObj.state;
  }

  _formatName(stateObj) {
    if (this._config?.name) return this._config.name;
    if (this._hass?.formatEntityName) {
      return this._hass.formatEntityName(stateObj);
    }
    return stateObj.attributes?.friendly_name || stateObj.entity_id;
  }

  _computeColor() {
    const color = this._config?.color;
    if (!color) return '';
    if (color.startsWith('#') || color.startsWith('rgb') || color.startsWith('var(')) {
      return escapeHtml(color);
    }
    return `var(--state-${color}-color, var(--${color}-color, ${escapeHtml(color)}))`;
  }

  _toggleMenu(ev) {
    ev?.stopPropagation();
    this._open = !this._open;
    this._renderMenu();
    if (this._open) {
      const first = this.shadowRoot.querySelector('.option');
      first?.focus();
    }
  }

  _closeOnOutside(ev) {
    if (!this._open) return;
    const path = ev.composedPath ? ev.composedPath() : [ev.target];
    if (!path.includes(this)) {
      this._open = false;
      this._renderMenu();
    }
  }

  _handleKey(ev) {
    if (ev.key === 'Escape') {
      this._open = false;
      this._renderMenu();
      return;
    }
    if (!this._open) return;
    const options = Array.from(this.shadowRoot.querySelectorAll('.option'));
    const idx = options.indexOf(this.shadowRoot.activeElement);
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      const next = options[(idx + 1) % options.length];
      next?.focus();
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      const prev = options[(idx - 1 + options.length) % options.length];
      prev?.focus();
    } else if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      if (idx >= 0) this._select(options[idx].dataset.value);
    }
  }

  _select(value) {
    this._open = false;
    this._renderMenu();
    if (!this._hass || !this._config) return;
    const call = buildServiceCall(this._config, value, this._config.entity);
    if (!call) return;
    this._hass.callService(call.domain, call.service, call.data);
  }

  _render() {
    if (!this.shadowRoot) return;
    const badge = this.shadowRoot.querySelector('.badge');
    if (!this._config || !this._hass) {
      badge.className = 'badge error';
      badge.innerHTML = '<ha-icon icon="mdi:alert-circle"></ha-icon><span>Unavailable</span>';
      this._renderMenu();
      return;
    }

    const stateObj = this._hass.states?.[this._config.entity];
    if (!stateObj) {
      badge.className = 'badge error';
      badge.innerHTML = '<ha-icon icon="mdi:alert-circle"></ha-icon><span>Entity not found</span>';
      this._renderMenu();
      return;
    }

    badge.className = 'badge';
    badge.style.setProperty('--badge-color', this._computeColor() || 'var(--state-inactive-color)');
    badge.setAttribute('tabindex', '0');
    badge.setAttribute('role', 'button');
    badge.setAttribute('aria-haspopup', 'listbox');
    badge.setAttribute('aria-expanded', String(this._open));

    const name = this._config.show_name ? this._formatName(stateObj) : '';
    const state = this._config.show_state ? this._formatState(stateObj) : '';
    const icon = this._config.icon ? this._config.icon : stateObj.attributes?.icon;

    let iconHtml;
    if (icon) {
      iconHtml = `<ha-icon icon="${escapeHtml(icon)}"></ha-icon>`;
    } else {
      iconHtml = `<ha-state-icon></ha-state-icon>`;
    }

    let contentHtml = '';
    if (name && state) {
      contentHtml = `<span class="content"><span class="name">${escapeHtml(name)}</span><span class="state">${escapeHtml(state)}</span></span>`;
    } else if (name) {
      contentHtml = `<span class="content">${escapeHtml(name)}</span>`;
    } else if (state) {
      contentHtml = `<span class="content">${escapeHtml(state)}</span>`;
    }

    const options = resolveOptions(this._hass, this._config);
    const arrow = options.length
      ? `<ha-icon icon="mdi:chevron-down" class="arrow"></ha-icon>`
      : '';

    badge.innerHTML = `${iconHtml}${contentHtml}${arrow}`;

    // Bind ha-state-icon properties if present
    const stateIcon = badge.querySelector('ha-state-icon');
    if (stateIcon) {
      stateIcon.hass = this._hass;
      stateIcon.stateObj = stateObj;
    }

    this._renderMenu();
  }

  _renderMenu() {
    if (!this.shadowRoot) return;
    const existing = this.shadowRoot.querySelector('.menu');
    if (existing) existing.remove();
    if (!this._open || !this._config || !this._hass) return;

    const options = resolveOptions(this._hass, this._config);
    if (!options.length) return;

    const menu = document.createElement('div');
    menu.className = 'menu';
    menu.setAttribute('role', 'listbox');
    menu.addEventListener('click', (ev) => ev.stopPropagation());

    for (const opt of options) {
      const btn = document.createElement('button');
      btn.className = 'option';
      btn.setAttribute('role', 'option');
      btn.setAttribute('tabindex', '-1');
      btn.dataset.value = opt.value;
      btn.innerHTML = opt.icon
        ? `<ha-icon icon="${escapeHtml(opt.icon)}"></ha-icon><span>${escapeHtml(opt.label)}</span>`
        : `<span>${escapeHtml(opt.label)}</span>`;
      btn.addEventListener('click', () => this._select(opt.value));
      menu.appendChild(btn);
    }

    this.shadowRoot.appendChild(menu);
  }
}

customElements.define('dropdown-badge', DropdownBadge);

window.customBadges = window.customBadges || [];
window.customBadges.push({
  type: 'dropdown-badge',
  name: 'Dropdown Badge',
  description: 'A badge that displays an entity state and opens a dropdown menu on tap.',
  preview: true,
  documentationURL: 'https://github.com/portbusy/ha-dropdown-badge',
});

export default DropdownBadge;
