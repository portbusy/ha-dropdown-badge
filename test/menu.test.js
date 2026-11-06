import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';

beforeAll(() => {
  customElements.define(
    'ha-icon',
    class extends HTMLElement {
      set icon(value) {
        this.setAttribute('icon', value);
      }
    }
  );
  customElements.define(
    'ha-state-icon',
    class extends HTMLElement {
      set hass(_) {}
      set stateObj(_) {}
    }
  );
});

const flush = () => new Promise((resolve) => requestAnimationFrame(resolve));

function makeHass(overrides = {}) {
  return {
    states: {
      'select.mode': {
        entity_id: 'select.mode',
        state: 'eco',
        attributes: {
          options: ['eco', 'comfort', 'away'],
          friendly_name: 'Mode',
        },
      },
    },
    formatEntityState: (s) => s.state,
    formatEntityName: (s) => s.attributes.friendly_name,
    callService: vi.fn(),
    ...overrides,
  };
}

function createBadge(config) {
  const badge = document.createElement('dropdown-badge');
  badge.setConfig(config);
  badge.hass = makeHass();
  document.body.appendChild(badge);
  return badge;
}

describe('DropdownBadge menu rendering', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    HTMLElement.prototype.showPopover = undefined;
    HTMLElement.prototype.hidePopover = undefined;
  });

  it('uses the Popover API when available', async () => {
    const showPopover = vi.fn(function () {
      this._popoverOpen = true;
    });
    const hidePopover = vi.fn(function () {
      this._popoverOpen = false;
    });
    HTMLElement.prototype.showPopover = showPopover;
    HTMLElement.prototype.hidePopover = hidePopover;

    const { default: DropdownBadge } = await import('../src/dropdown-badge.js');
    const badge = createBadge({ entity: 'select.mode' });
    await flush();

    badge.shadowRoot.querySelector('.badge').click();
    await flush();

    const menu = badge._menu;
    expect(menu).not.toBeUndefined();
    expect(showPopover).toHaveBeenCalledTimes(1);
    expect(menu.getAttribute('popover')).toBe('manual');
    expect(menu.parentNode).toBe(badge.shadowRoot);

    menu.querySelector('[data-value="comfort"]').click();
    await flush();

    expect(hidePopover).toHaveBeenCalledTimes(1);
    expect(badge._menu).toBeUndefined();
    expect(badge.shadowRoot.querySelector('.menu')).toBeNull();
    expect(badge.hass.callService).toHaveBeenCalledWith('select', 'select_option', {
      option: 'comfort',
      entity_id: 'select.mode',
    });

    badge.remove();
  });

  it('falls back to document.body when Popover API is unavailable', async () => {
    HTMLElement.prototype.showPopover = undefined;
    HTMLElement.prototype.hidePopover = undefined;

    await import('../src/dropdown-badge.js');
    const badge = createBadge({ entity: 'select.mode' });
    await flush();

    badge.shadowRoot.querySelector('.badge').click();
    await flush();

    const menu = badge._menu;
    expect(menu).not.toBeUndefined();
    expect(menu.parentNode).toBe(document.body);
    expect(menu.querySelector('style')).not.toBeNull();
    expect(menu.getAttribute('popover')).toBeNull();

    menu.querySelector('[data-value="away"]').click();
    await flush();

    expect(badge._menu).toBeUndefined();
    expect(document.body.querySelector('.menu')).toBeNull();
    expect(badge.hass.callService).toHaveBeenCalledWith('select', 'select_option', {
      option: 'away',
      entity_id: 'select.mode',
    });

    badge.remove();
  });

  it('closes the menu on an outside click when using body fallback', async () => {
    HTMLElement.prototype.showPopover = undefined;
    HTMLElement.prototype.hidePopover = undefined;

    await import('../src/dropdown-badge.js');
    const badge = createBadge({ entity: 'select.mode' });
    await flush();

    badge.shadowRoot.querySelector('.badge').click();
    await flush();

    expect(badge._menu).not.toBeUndefined();

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flush();

    expect(badge._menu).toBeUndefined();

    badge.remove();
  });

  it('keeps the menu open when clicking inside it', async () => {
    HTMLElement.prototype.showPopover = undefined;
    HTMLElement.prototype.hidePopover = undefined;

    await import('../src/dropdown-badge.js');
    const badge = createBadge({ entity: 'select.mode' });
    await flush();

    badge.shadowRoot.querySelector('.badge').click();
    await flush();

    const menu = badge._menu;
    expect(menu).not.toBeUndefined();

    menu.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flush();

    expect(badge._menu).not.toBeUndefined();

    badge.remove();
  });
});
