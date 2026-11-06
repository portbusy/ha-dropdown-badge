import { describe, it, expect } from 'vitest';
import { resolveOptions, buildServiceCall, replaceValue } from '../src/utils.js';

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

  it('falls back to static options for generic entities', () => {
    const opts = resolveOptions(hass, {
      entity: 'sensor.generic',
      options: [
        { label: 'Low', value: 'low', icon: 'mdi:fan-speed-1' },
        { label: 'High', value: 'high' },
      ],
    });
    expect(opts).toEqual([
      { label: 'Low', value: 'low', icon: 'mdi:fan-speed-1' },
      { label: 'High', value: 'high' },
    ]);
  });

  it('returns an empty array for missing entity and options', () => {
    expect(resolveOptions(hass, { entity: 'sensor.missing' })).toEqual([]);
    expect(resolveOptions(hass, {})).toEqual([]);
  });
});

describe('replaceValue', () => {
  it('replaces placeholders in strings', () => {
    expect(replaceValue('{{value}}', 'foo')).toBe('foo');
    expect(replaceValue('val={{value}}!', 'foo')).toBe('val=foo!');
  });

  it('replaces placeholders recursively', () => {
    const input = {
      level: '{{value}}',
      nested: { list: ['{{value}}', 1, { key: '{{value}}' }] },
    };
    expect(replaceValue(input, 'foo')).toEqual({
      level: 'foo',
      nested: { list: ['foo', 1, { key: 'foo' }] },
    });
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

  it('builds a custom action with placeholder replacement', () => {
    const config = {
      action: {
        service: 'light.turn_on',
        data: { brightness: '{{value}}', entity_id: 'light.living_room' },
      },
    };
    const call = buildServiceCall(config, '200', 'sensor.generic');
    expect(call).toEqual({
      domain: 'light',
      service: 'turn_on',
      data: { brightness: '200', entity_id: 'light.living_room' },
    });
  });

  it('adds entity_id when missing for custom actions', () => {
    const config = {
      action: { service: 'fan.set_speed', data: { speed: '{{value}}' } },
    };
    const call = buildServiceCall(config, 'high', 'sensor.generic');
    expect(call.data.entity_id).toBe('sensor.generic');
  });

  it('returns null for unsupported domains without action', () => {
    expect(buildServiceCall({}, 'x', 'sensor.generic')).toBeNull();
  });
});
