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
  if (stateObj) {
    const domain = entityId.split('.')[0];
    if ((domain === 'select' || domain === 'input_select') && Array.isArray(stateObj.attributes?.options)) {
      return stateObj.attributes.options.map((opt) =>
        typeof opt === 'object' && opt !== null
          ? { label: String(opt.label ?? opt.value), value: String(opt.value), icon: opt.icon }
          : { label: String(opt), value: String(opt) }
      );
    }
  }
  if (Array.isArray(config.options)) {
    return config.options.map((opt) =>
      typeof opt === 'object' && opt !== null
        ? { label: String(opt.label ?? opt.value), value: String(opt.value), icon: opt.icon }
        : { label: String(opt), value: String(opt) }
    );
  }
  return [];
}

/**
 * Deep clone and replace occurrences of '{{value}}' with the provided value.
 * @param {any} obj
 * @param {string} value
 * @returns {any}
 */
export function replaceValue(obj, value) {
  if (typeof obj === 'string') {
    return obj.replace(/\{\{value\}\}/g, value);
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => replaceValue(item, value));
  }
  if (obj !== null && typeof obj === 'object') {
    const result = {};
    for (const [key, val] of Object.entries(obj)) {
      result[key] = replaceValue(val, value);
    }
    return result;
  }
  return obj;
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
  if (config.action?.service) {
    const [actionDomain, service] = String(config.action.service).split('.', 2);
    if (!actionDomain || !service) return null;
    const data = replaceValue(config.action.data ?? {}, value);
    if (!data.entity_id && !data.target) {
      data.entity_id = entityId;
    }
    return { domain: actionDomain, service, data };
  }
  return null;
}
