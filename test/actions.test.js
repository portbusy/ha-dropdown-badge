import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runAction } from '../src/actions.js';

const baseConfig = { entity: 'select.mode', dropdown_on: 'tap' };

function makeNode() {
  return document.createElement('div');
}

function makeHass() {
  return { callService: vi.fn() };
}

describe('runAction', () => {
  let node;
  let hass;

  beforeEach(() => {
    node = makeNode();
    hass = makeHass();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does nothing for action none', () => {
    const listener = vi.fn();
    node.addEventListener('hass-more-info', listener);
    runAction(node, hass, { ...baseConfig, tap_action: { action: 'none' } }, 'tap');
    expect(listener).not.toHaveBeenCalled();
    expect(hass.callService).not.toHaveBeenCalled();
  });

  it('dispatches hass-more-info', () => {
    const listener = vi.fn();
    node.addEventListener('hass-more-info', listener);
    runAction(node, hass, { ...baseConfig, tap_action: { action: 'more-info' } }, 'tap');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail.entityId).toBe('select.mode');
  });

  it('uses action entity override for more-info', () => {
    const listener = vi.fn();
    node.addEventListener('hass-more-info', listener);
    runAction(
      node,
      hass,
      { ...baseConfig, tap_action: { action: 'more-info', entity: 'light.other' } },
      'tap'
    );
    expect(listener.mock.calls[0][0].detail.entityId).toBe('light.other');
  });

  it('calls homeassistant.toggle', () => {
    runAction(
      node,
      hass,
      { ...baseConfig, tap_action: { action: 'toggle' } },
      'tap'
    );
    expect(hass.callService).toHaveBeenCalledWith('homeassistant', 'toggle', {
      entity_id: 'select.mode',
    });
  });

  it('calls a perform-action service', () => {
    runAction(
      node,
      hass,
      {
        ...baseConfig,
        tap_action: {
          action: 'perform-action',
          perform_action: 'light.turn_on',
          data: { brightness_pct: 50 },
          target: { entity_id: 'light.bulb' },
        },
      },
      'tap'
    );
    expect(hass.callService).toHaveBeenCalledWith(
      'light',
      'turn_on',
      { brightness_pct: 50 },
      { entity_id: 'light.bulb' }
    );
  });

  it('calls a legacy call-service action', () => {
    runAction(
      node,
      hass,
      {
        ...baseConfig,
        tap_action: {
          action: 'call-service',
          perform_action: 'scene.turn_on',
        },
      },
      'tap'
    );
    expect(hass.callService).toHaveBeenCalledWith('scene', 'turn_on', {}, undefined);
  });

  it('navigates with pushState and dispatches location-changed', () => {
    const pushSpy = vi.spyOn(history, 'pushState').mockImplementation(() => {});
    const listener = vi.fn();
    window.addEventListener('location-changed', listener);

    runAction(
      node,
      hass,
      {
        ...baseConfig,
        tap_action: { action: 'navigate', navigation_path: '/test', navigation_replace: true },
      },
      'tap'
    );

    expect(pushSpy).toHaveBeenCalledWith(null, '', '/test');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail.replace).toBe(true);

    pushSpy.mockRestore();
    window.removeEventListener('location-changed', listener);
  });

  it('opens url in a new tab', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    runAction(
      node,
      hass,
      { ...baseConfig, tap_action: { action: 'url', url_path: 'https://example.com' } },
      'tap'
    );
    expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank');
    openSpy.mockRestore();
  });

  it('does not open url when url_path is empty', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    runAction(node, hass, { ...baseConfig, tap_action: { action: 'url', url_path: '' } }, 'tap');
    expect(openSpy).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it('ignores assist action silently', () => {
    const listener = vi.fn();
    node.addEventListener('hass-more-info', listener);
    runAction(node, hass, { ...baseConfig, tap_action: { action: 'assist' } }, 'tap');
    expect(listener).not.toHaveBeenCalled();
    expect(hass.callService).not.toHaveBeenCalled();
  });

  it('ignores unknown action silently', () => {
    const listener = vi.fn();
    node.addEventListener('hass-more-info', listener);
    runAction(node, hass, { ...baseConfig, tap_action: { action: 'fireworks' } }, 'tap');
    expect(listener).not.toHaveBeenCalled();
    expect(hass.callService).not.toHaveBeenCalled();
  });

  it('defaults tap to more-info when dropdown_on is not tap', () => {
    const listener = vi.fn();
    node.addEventListener('hass-more-info', listener);
    runAction(node, hass, { ...baseConfig, dropdown_on: 'hold' }, 'tap');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('defaults tap to none when dropdown_on is tap', () => {
    const listener = vi.fn();
    node.addEventListener('hass-more-info', listener);
    runAction(node, hass, baseConfig, 'tap');
    expect(listener).not.toHaveBeenCalled();
    expect(hass.callService).not.toHaveBeenCalled();
  });

  it('defaults hold and double_tap to none', () => {
    const listener = vi.fn();
    node.addEventListener('hass-more-info', listener);
    runAction(node, hass, baseConfig, 'hold');
    runAction(node, hass, baseConfig, 'double_tap');
    expect(listener).not.toHaveBeenCalled();
    expect(hass.callService).not.toHaveBeenCalled();
  });
});
