import { describe, it, expect } from 'vitest';
import '../src/dropdown-badge.js';

function makeHass(overrides = {}) {
  return {
    states: {
      'select.mode': {
        entity_id: 'select.mode',
        state: 'eco',
        attributes: {
          options: ['eco', 'comfort'],
          friendly_name: 'Mode',
        },
      },
      'select.empty': {
        entity_id: 'select.empty',
        state: 'unknown',
        attributes: {
          options: [],
          friendly_name: 'Empty',
        },
      },
      'input_select.scene': {
        entity_id: 'input_select.scene',
        state: 'morning',
        attributes: {
          options: ['morning', 'evening'],
          friendly_name: 'Scene',
        },
      },
      'light.bulb': {
        entity_id: 'light.bulb',
        state: 'on',
        attributes: {
          friendly_name: 'Bulb',
        },
      },
    },
    localize: (key) =>
      key === 'ui.panel.lovelace.editor.badge_picker.with_name'
        ? 'Con nome'
        : key,
    ...overrides,
  };
}

describe('custom badge entity suggestions', () => {
  const entry = window.customBadges?.find((b) => b.type === 'dropdown-badge');

  it('exposes getEntitySuggestion on the custom badge entry', () => {
    expect(entry).toBeDefined();
    expect(typeof entry.getEntitySuggestion).toBe('function');
  });

  it('returns two suggestions for a select entity with options', () => {
    const suggestions = entry.getEntitySuggestion(makeHass(), 'select.mode');
    expect(suggestions).toHaveLength(2);
    expect(suggestions[0].label).toBeUndefined();
    expect(suggestions[0].config).toEqual({
      type: 'custom:dropdown-badge',
      entity: 'select.mode',
      show_state: true,
      show_name: false,
      dropdown_on: 'tap',
    });
    expect(suggestions[1].label).toBe('Con nome');
    expect(suggestions[1].config).toEqual({
      type: 'custom:dropdown-badge',
      entity: 'select.mode',
      show_state: true,
      show_name: true,
      dropdown_on: 'tap',
    });
  });

  it('returns two suggestions for an input_select entity with options', () => {
    const suggestions = entry.getEntitySuggestion(
      makeHass(),
      'input_select.scene'
    );
    expect(suggestions).toHaveLength(2);
    expect(suggestions[0].config.show_name).toBe(false);
    expect(suggestions[1].config.show_name).toBe(true);
    expect(suggestions[0].config.type).toBe('custom:dropdown-badge');
    expect(suggestions[1].config.type).toBe('custom:dropdown-badge');
  });

  it('returns null for a non-select entity', () => {
    expect(entry.getEntitySuggestion(makeHass(), 'light.bulb')).toBeNull();
  });

  it('returns null for a select entity with empty options', () => {
    expect(entry.getEntitySuggestion(makeHass(), 'select.empty')).toBeNull();
  });

  it('returns null for a missing entity', () => {
    expect(entry.getEntitySuggestion(makeHass(), 'select.missing')).toBeNull();
  });

  it('does not throw when hass is missing', () => {
    expect(() =>
      entry.getEntitySuggestion(undefined, 'select.mode')
    ).not.toThrow();
    expect(entry.getEntitySuggestion(undefined, 'select.mode')).toBeNull();
  });
});
