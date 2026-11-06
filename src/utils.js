/**
 * @typedef {Object} Option
 * @property {string} label
 * @property {string} value
 * @property {string} [icon]
 */

/**
 * @param {any} hass
 * @param {any} config
 * @returns {Option[]}
 */
export function resolveOptions(hass, config) {
  if (!hass || !config) return [];
  const entityId = config.entity;
  if (!entityId) return [];
  const stateObj = hass.states?.[entityId];
  if (!stateObj) return [];
  const domain = entityId.split('.')[0];
  if ((domain === 'select' || domain === 'input_select') && Array.isArray(stateObj.attributes?.options)) {
    return stateObj.attributes.options.map((opt) =>
      typeof opt === 'object' && opt !== null
        ? { label: String(opt.label ?? opt.value), value: String(opt.value), icon: opt.icon }
        : { label: String(opt), value: String(opt) }
    );
  }
  return [];
}

/**
 * @param {string} entityId
 * @returns {string}
 */
export function getDomain(entityId) {
  return entityId.split('.')[0];
}

/**
 * Build the service call for a selected option.
 * @param {any} config
 * @param {string} value
 * @param {string} entityId
 * @returns {{domain:string, service:string, data:any}|null}
 */
export function buildServiceCall(config, value, entityId) {
  const domain = getDomain(entityId);
  if (domain === 'select' || domain === 'input_select') {
    return {
      domain,
      service: 'select_option',
      data: { option: value, entity_id: entityId },
    };
  }
  return null;
}
