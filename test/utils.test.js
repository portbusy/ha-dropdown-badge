import { describe, it, expect } from 'vitest';
import { resolveOptions, buildServiceCall } from '../src/utils.js';

const hass = {
  states: {
    'select.mode': {
      entity_id: 'select.mode',
      state: 'eco',
      attributes: {
        options: ['eco', 'comfort', 'away'],
        friendly_name: 'Mode',
      },
    },
    'input_select.scene': {
      entity_id: 'input_select.scene',
      state: 'morning',
      attributes: {
        options: ['morning', 'evening', 'night'],
        friendly_name: 'Scene',
      },
    },
    'sensor.generic': {
      entity_id: 'sensor.generic',
      state: '42',
      attributes: {},
    },
  },
};

describe('resolveOptions', () => {
  it('returns options from a select entity', () => {
    const opts = resolveOptions(hass, { entity: 'select.mode' });
    expect(opts).toEqual([
      { label: 'eco', value: 'eco' },
      { label: 'comfort', value: 'comfort' },
      { label: 'away', value: 'away' },
    ]);
  });

  it('returns options from an input_select entity', () => {
    const opts = resolveOptions(hass, { entity: 'input_select.scene' });
    expect(opts).toHaveLength(3);
    expect(opts[2].value).toBe('night');
  });

  it('returns an empty array for unsupported domains', () => {
    expect(resolveOptions(hass, { entity: 'sensor.generic' })).toEqual([]);
  });

  it('returns an empty array for missing entity', () => {
    expect(resolveOptions(hass, { entity: 'sensor.missing' })).toEqual([]);
    expect(resolveOptions(hass, {})).toEqual([]);
  });
});

describe('buildServiceCall', () => {
  it('builds a select.select_option call', () => {
    const call = buildServiceCall({}, 'comfort', 'select.mode');
    expect(call).toEqual({
      domain: 'select',
      service: 'select_option',
      data: { option: 'comfort', entity_id: 'select.mode' },
    });
  });

  it('builds an input_select.select_option call', () => {
    const call = buildServiceCall({}, 'night', 'input_select.scene');
    expect(call).toEqual({
      domain: 'input_select',
      service: 'select_option',
      data: { option: 'night', entity_id: 'input_select.scene' },
    });
  });

  it('returns null for unsupported domains', () => {
    expect(buildServiceCall({}, 'x', 'sensor.generic')).toBeNull();
  });
});
