import { describe, it, expect, beforeAll, vi } from 'vitest';
import { BADGE_STYLE } from '../src/dropdown-badge.js';

beforeAll(() => {
  // Stub Home Assistant icon elements so the badge can render.
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

describe('DropdownBadge smoke', () => {
  it('registers the custom element and window.customBadges entry', async () => {
    const { default: DropdownBadge } = await import('../src/dropdown-badge.js');
    expect(customElements.get('dropdown-badge')).toBe(DropdownBadge);
    const entry = window.customBadges?.find((b) => b.type === 'dropdown-badge');
    expect(entry).toMatchObject({
      type: 'dropdown-badge',
      name: 'Dropdown Badge',
      preview: true,
    });
  });

  it('renders a select entity state and opens the menu on click', async () => {
    await import('../src/dropdown-badge.js');
    const badge = createBadge({
      entity: 'select.mode',
      show_state: true,
      show_name: true,
    });
    await flush();

    const root = badge.shadowRoot;
    expect(root.querySelector('.badge')).not.toBeNull();
    expect(root.textContent).toContain('eco');
    expect(root.textContent).toContain('Mode');
    expect(root.querySelector('.menu')).toBeNull();

    root.querySelector('.badge').click();
    await flush();

    const menu = root.querySelector('.menu');
    expect(menu).not.toBeNull();
    expect(menu.querySelectorAll('.option').length).toBe(3);

    menu.querySelector('[data-value="comfort"]').click();
    await flush();

    expect(badge.hass.callService).toHaveBeenCalledWith('select', 'select_option', {
      option: 'comfort',
      entity_id: 'select.mode',
    });
    expect(root.querySelector('.menu')).toBeNull();

    badge.remove();
  });

  it('renders an error state when the entity is missing', async () => {
    await import('../src/dropdown-badge.js');
    const badge = document.createElement('dropdown-badge');
    badge.setConfig({ entity: 'select.missing' });
    badge.hass = { states: {} };
    document.body.appendChild(badge);
    await flush();
    expect(badge.shadowRoot.querySelector('.badge.error')).not.toBeNull();
    badge.remove();
  });

  it('shows the label above the state only when both name and state are shown', async () => {
    await import('../src/dropdown-badge.js');
    const badgeBoth = createBadge({
      entity: 'select.mode',
      show_name: true,
      show_state: true,
    });
    await flush();
    expect(badgeBoth.shadowRoot.querySelector('.label')).not.toBeNull();
    expect(badgeBoth.shadowRoot.querySelector('.content')).not.toBeNull();
    badgeBoth.remove();

    const badgeNameOnly = createBadge({
      entity: 'select.mode',
      show_name: true,
      show_state: false,
    });
    await flush();
    expect(badgeNameOnly.shadowRoot.querySelector('.label')).toBeNull();
    expect(badgeNameOnly.shadowRoot.querySelector('.content').textContent).toBe('Mode');
    badgeNameOnly.remove();

    const badgeStateOnly = createBadge({
      entity: 'select.mode',
      show_name: false,
      show_state: true,
    });
    await flush();
    expect(badgeStateOnly.shadowRoot.querySelector('.label')).toBeNull();
    expect(badgeStateOnly.shadowRoot.querySelector('.content').textContent).toBe('eco');
    badgeStateOnly.remove();
  });

  it('opens the menu on hold when dropdown_on is hold', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await import('../src/dropdown-badge.js');
    const badge = createBadge({
      entity: 'select.mode',
      dropdown_on: 'hold',
    });
    await flush();

    const badgeEl = badge.shadowRoot.querySelector('.badge');
    badgeEl.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));
    expect(badge.shadowRoot.querySelector('.menu')).toBeNull();

    vi.advanceTimersByTime(500);
    await flush();

    expect(badge.shadowRoot.querySelector('.menu')).not.toBeNull();

    badge.remove();
    vi.useRealTimers();
  });

  it('falls back to hass-more-info on tap when dropdown_on is hold', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await import('../src/dropdown-badge.js');
    const badge = createBadge({
      entity: 'select.mode',
      dropdown_on: 'hold',
    });
    await flush();

    const listener = vi.fn();
    badge.addEventListener('hass-more-info', listener);

    const badgeEl = badge.shadowRoot.querySelector('.badge');
    badgeEl.click();
    await flush();

    expect(listener).toHaveBeenCalledTimes(1);
    const event = listener.mock.calls[0][0];
    expect(event.detail.entityId).toBe('select.mode');

    badge.remove();
    vi.useRealTimers();
  });

  it('runs configured tap_action directly when dropdown_on is hold', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await import('../src/dropdown-badge.js');
    const pushSpy = vi.spyOn(history, 'pushState').mockImplementation(() => {});
    const locationListener = vi.fn();
    window.addEventListener('location-changed', locationListener);

    const badge = createBadge({
      entity: 'select.mode',
      dropdown_on: 'hold',
      tap_action: { action: 'navigate', navigation_path: '/test' },
    });
    await flush();

    const badgeEl = badge.shadowRoot.querySelector('.badge');
    badgeEl.click();
    await flush();

    expect(pushSpy).toHaveBeenCalledWith(null, '', '/test');
    expect(locationListener).toHaveBeenCalledTimes(1);

    pushSpy.mockRestore();
    window.removeEventListener('location-changed', locationListener);
    badge.remove();
    vi.useRealTimers();
  });

  it('does not set the badge background from badge-color', () => {
    const badgeBlock = BADGE_STYLE.match(/\.badge\s*\{([^}]+)\}/s)?.[1] || '';
    expect(badgeBlock).not.toContain('background-color: var(--badge-color');
  });
});
