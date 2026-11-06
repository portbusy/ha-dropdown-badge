import { resolveOptions, buildServiceCall } from './utils.js';
import { runAction } from './actions.js';

export const BADGE_STYLE = `
  :host {
    display: inline-flex;
    position: relative;
    vertical-align: middle;
    --badge-color: var(--secondary-text-color);
  }
  .badge {
    height: var(--ha-badge-size, 36px);
    min-width: var(--ha-badge-size, 36px);
    border-radius: var(--ha-badge-border-radius, calc(var(--ha-badge-size, 36px) / 2));
    padding: 0 12px;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background-color: var(--ha-card-background, var(--card-background-color, white));
    backdrop-filter: var(--ha-card-backdrop-filter, none);
    border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color, #e0e0e0));
    box-shadow: var(--ha-card-box-shadow, none);
    color: var(--badge-color);
    font-family: var(--paper-font-body1_-_font-family, inherit);
    cursor: pointer;
    user-select: none;
    transition: box-shadow 0.2s ease;
    outline: none;
    position: relative;
    overflow: hidden;
  }
  .badge::before {
    content: "";
    position: absolute;
    inset: 0;
    background-color: var(--badge-color);
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
  }
  .badge:hover::before {
    opacity: 0.04;
  }
  .badge:active::before,
  .badge.pressed::before {
    opacity: 0.12;
  }
  .badge:focus-visible {
    border-color: var(--badge-color);
    box-shadow: 0 0 0 1px var(--badge-color);
  }
  .badge.error {
    --badge-color: var(--error-color, var(--red-color, #db4437));
  }
  .text {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    line-height: 1.2;
  }
  .label {
    font-size: var(--ha-font-size-xs, 10px);
    font-weight: 500;
    line-height: 10px;
    color: var(--secondary-text-color);
  }
  .content {
    font-size: var(--ha-badge-font-size, var(--ha-font-size-s, 14px));
    font-weight: 500;
    color: var(--primary-text-color);
  }
  ha-icon,
  ha-state-icon {
    position: relative;
    z-index: 1;
    color: var(--badge-color);
    --mdc-icon-size: var(--ha-badge-icon-size, 18px);
    width: var(--ha-badge-icon-size, 18px);
    height: var(--ha-badge-icon-size, 18px);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .arrow {
    color: var(--secondary-text-color);
    --mdc-icon-size: 16px;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
  .menu {
    position: fixed;
    z-index: 1000;
    margin: 0;
    inset: auto;
    min-width: 160px;
    max-width: 280px;
    max-height: 300px;
    overflow-y: auto;
    background: var(--ha-card-background, var(--card-background-color, white));
    color: var(--primary-text-color);
    border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color, #e0e0e0));
    border-radius: var(--ha-card-border-radius, 12px);
    box-shadow: var(--ha-card-box-shadow, var(--shadow-elevation-8dp, 0 4px 12px rgba(0,0,0,0.2)));
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
    background: var(--secondary-background-color, rgba(127,127,127,0.2));
  }
`;

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isActiveState(state) {
  return !['off', 'unavailable', 'unknown'].includes(state);
}

class DropdownBadge extends HTMLElement {
  constructor() {
    super();
    this._config = undefined;
    this._hass = undefined;
    this._open = false;
    this._holdTimer = undefined;
    this._tapTimer = undefined;
    this._lastTap = 0;
    this._suppressClick = false;
    this._menu = undefined;
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>${BADGE_STYLE}</style><div class="badge"></div>`;

    this._boundClick = this._handleClick.bind(this);
    this._boundClose = this._closeOnOutside.bind(this);
    this._boundKey = this._handleKey.bind(this);
    this._boundPointerDown = this._handlePointerDown.bind(this);
    this._boundPointerUp = this._handlePointerUp.bind(this);
    this._boundPointerLeave = this._handlePointerLeave.bind(this);
    this._boundReposition = this._repositionMenu.bind(this);
  }

  connectedCallback() {
    const badge = this.shadowRoot.querySelector('.badge');
    badge.addEventListener('click', this._boundClick);
    badge.addEventListener('pointerdown', this._boundPointerDown);
    badge.addEventListener('pointerup', this._boundPointerUp);
    badge.addEventListener('pointerleave', this._boundPointerLeave);
    document.addEventListener('click', this._boundClose);
    document.addEventListener('scroll', this._boundReposition, true);
    window.addEventListener('resize', this._boundReposition);
    this.addEventListener('keydown', this._boundKey);
  }

  disconnectedCallback() {
    const badge = this.shadowRoot.querySelector('.badge');
    badge.removeEventListener('click', this._boundClick);
    badge.removeEventListener('pointerdown', this._boundPointerDown);
    badge.removeEventListener('pointerup', this._boundPointerUp);
    badge.removeEventListener('pointerleave', this._boundPointerLeave);
    document.removeEventListener('click', this._boundClose);
    document.removeEventListener('scroll', this._boundReposition, true);
    window.removeEventListener('resize', this._boundReposition);
    this.removeEventListener('keydown', this._boundKey);
    this._clearHoldTimer();
    this._clearTapTimer();
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
      dropdown_on: 'tap',
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
      dropdown_on: 'tap',
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
    const stateObj = this._hass?.states?.[this._config?.entity];
    if (!stateObj) {
      return '';
    }
    const color = this._config?.color;
    const active = isActiveState(stateObj.state);
    if (color) {
      if (!active) return '';
      if (color.startsWith('#') || color.startsWith('rgb') || color.startsWith('var(')) {
        return escapeHtml(color);
      }
      return `var(--${escapeHtml(color)}-color, var(--state-${escapeHtml(color)}-color, ${escapeHtml(color)}))`;
    }
    if (active) {
      return 'var(--primary-color)';
    }
    return 'var(--state-inactive-color)';
  }

  _dropdownOn() {
    const cfg = this._config;
    if (!cfg) return 'tap';
    if (cfg.dropdown_on === 'hold' || cfg.dropdown_on === 'double_tap') {
      return cfg.dropdown_on;
    }
    return 'tap';
  }

  _hasAction(type) {
    const cfg = this._config;
    if (!cfg) return false;
    const action = cfg[`${type}_action`];
    return action && typeof action === 'object' && Object.keys(action).length > 0;
  }

  _runAction(type) {
    runAction(this, this._hass, this._config, type);
  }

  _openMenu() {
    this._open = true;
    this._renderMenu();
    if (this._open) {
      const first = this.shadowRoot.querySelector('.option');
      first?.focus();
    }
  }

  _closeMenu() {
    this._open = false;
    this._renderMenu();
  }

  _toggleMenu() {
    this._open = !this._open;
    this._renderMenu();
    if (this._open) {
      const first = this.shadowRoot.querySelector('.option');
      first?.focus();
    }
  }

  _handleClick(ev) {
    ev?.stopPropagation();
    if (this._suppressClick) {
      this._suppressClick = false;
      return;
    }
    if (this._dropdownOn() === 'double_tap' || this._hasAction('double_tap')) {
      this._handleDoubleTapDetection();
      return;
    }
    if (this._dropdownOn() === 'tap') {
      this._toggleMenu();
      return;
    }
    this._runAction('tap');
  }

  _handleDoubleTapDetection() {
    const now = Date.now();
    if (now - this._lastTap < 250) {
      this._clearTapTimer();
      this._lastTap = 0;
      if (this._dropdownOn() === 'double_tap') {
        this._openMenu();
      } else if (this._hasAction('double_tap')) {
        this._runAction('double_tap');
      }
      return;
    }
    this._lastTap = now;
    this._clearTapTimer();
    this._tapTimer = window.setTimeout(() => {
      this._tapTimer = undefined;
      this._lastTap = 0;
      if (this._dropdownOn() === 'tap') {
        this._toggleMenu();
      } else {
        this._runAction('tap');
      }
    }, 250);
  }

  _handlePointerDown(ev) {
    if (ev.button !== 0) return;
    const badge = this.shadowRoot.querySelector('.badge');
    badge.classList.add('pressed');
    this._clearHoldTimer();
    this._holdTimer = window.setTimeout(() => {
      this._holdTimer = undefined;
      badge.classList.remove('pressed');
      this._suppressClick = true;
      if (this._dropdownOn() === 'hold') {
        this._openMenu();
      } else if (this._hasAction('hold')) {
        this._runAction('hold');
      }
    }, 500);
  }

  _handlePointerUp() {
    this._clearHoldTimer();
    this.shadowRoot.querySelector('.badge').classList.remove('pressed');
  }

  _handlePointerLeave() {
    this._clearHoldTimer();
    this.shadowRoot.querySelector('.badge').classList.remove('pressed');
  }

  _clearHoldTimer() {
    if (this._holdTimer !== undefined) {
      clearTimeout(this._holdTimer);
      this._holdTimer = undefined;
    }
  }

  _clearTapTimer() {
    if (this._tapTimer !== undefined) {
      clearTimeout(this._tapTimer);
      this._tapTimer = undefined;
    }
  }

  _closeOnOutside(ev) {
    if (!this._open) return;
    const path = ev.composedPath ? ev.composedPath() : [ev.target];
    if (!path.includes(this) && !path.includes(this._menu)) {
      this._closeMenu();
    }
  }

  _handleKey(ev) {
    if (ev.key === 'Escape') {
      this._closeMenu();
      return;
    }
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      this._handleClick();
      return;
    }
    if (!this._open) return;
    const options = this._menu ? Array.from(this._menu.querySelectorAll('.option')) : [];
    const active = this.shadowRoot.activeElement || document.activeElement;
    const idx = options.indexOf(active);
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      const next = options[(idx + 1) % options.length];
      next?.focus();
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      const prev = options[(idx - 1 + options.length) % options.length];
      prev?.focus();
    }
  }

  _select(value) {
    this._closeMenu();
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
    const badgeColor = this._computeColor();
    if (badgeColor) {
      badge.style.setProperty('--badge-color', badgeColor);
    } else {
      badge.style.removeProperty('--badge-color');
    }
    badge.setAttribute('tabindex', '0');
    badge.setAttribute('role', 'button');
    badge.setAttribute('aria-haspopup', 'listbox');
    badge.setAttribute('aria-expanded', String(this._open));

    const showName = this._config.show_name;
    const showState = this._config.show_state;
    const name = showName ? this._formatName(stateObj) : '';
    const state = showState ? this._formatState(stateObj) : '';
    const icon = this._config.icon ? this._config.icon : stateObj.attributes?.icon;

    let iconHtml;
    if (icon) {
      iconHtml = `<ha-icon icon="${escapeHtml(icon)}"></ha-icon>`;
    } else {
      iconHtml = `<ha-state-icon></ha-state-icon>`;
    }

    let textHtml = '';
    if (showName && showState && name && state) {
      textHtml = `<span class="text"><span class="label">${escapeHtml(name)}</span><span class="content">${escapeHtml(state)}</span></span>`;
    } else if (name) {
      textHtml = `<span class="text"><span class="content">${escapeHtml(name)}</span></span>`;
    } else if (state) {
      textHtml = `<span class="text"><span class="content">${escapeHtml(state)}</span></span>`;
    }

    const options = resolveOptions(this._hass, this._config);
    const arrow = options.length
      ? `<ha-icon icon="mdi:chevron-down" class="arrow"></ha-icon>`
      : '';

    badge.innerHTML = `${iconHtml}${textHtml}${arrow}`;

    // Bind ha-state-icon properties if present
    const stateIcon = badge.querySelector('ha-state-icon');
    if (stateIcon) {
      stateIcon.hass = this._hass;
      stateIcon.stateObj = stateObj;
    }

    this._renderMenu();
  }

  _renderMenu() {
    if (this._menu) {
      this._hideMenu(this._menu);
      this._menu.remove();
      this._menu = undefined;
    }
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

    if (typeof menu.showPopover === 'function') {
      this.shadowRoot.appendChild(menu);
      menu.setAttribute('popover', 'manual');
      this._menu = menu;
      menu.showPopover();
    } else {
      this._applyMenuFallbackStyles(menu);
      document.body.appendChild(menu);
      this._menu = menu;
    }
    this._repositionMenu();
  }

  _hideMenu(menu) {
    try {
      menu.hidePopover();
    } catch (_) {}
  }

  _applyMenuFallbackStyles(menu) {
    const style = document.createElement('style');
    style.textContent = `
      .menu {
        position: fixed;
        z-index: 1000;
        margin: 0;
        inset: auto;
        min-width: 160px;
        max-width: 280px;
        max-height: 300px;
        overflow-y: auto;
        background: var(--ha-card-background, var(--card-background-color, white));
        color: var(--primary-text-color);
        border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color, #e0e0e0));
        border-radius: var(--ha-card-border-radius, 12px);
        box-shadow: var(--ha-card-box-shadow, var(--shadow-elevation-8dp, 0 4px 12px rgba(0,0,0,0.2)));
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
        background: var(--secondary-background-color, rgba(127,127,127,0.2));
      }
    `;
    menu.insertBefore(style, menu.firstChild);
  }

  _repositionMenu() {
    if (!this._menu || !this._open) return;
    const badge = this.shadowRoot.querySelector('.badge');
    const rect = badge.getBoundingClientRect();
    this._menu.style.left = `${rect.left}px`;
    this._menu.style.top = `${rect.bottom + 4}px`;
    this._menu.style.minWidth = `${rect.width}px`;
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
