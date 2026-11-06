import { describe, it, expect, beforeAll, vi } from 'vitest';

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
    const badge = document.createElement('dropdown-badge');
    const callService = vi.fn();
    badge.setConfig({
      entity: 'select.mode',
      show_state: true,
      show_name: true,
    });
    badge.hass = {
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
      callService,
    };
    document.body.appendChild(badge);
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

    expect(callService).toHaveBeenCalledWith('select', 'select_option', {
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
});
