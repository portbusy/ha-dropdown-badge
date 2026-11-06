export function runAction(node, hass, config, actionKind) {
  if (!config) return;

  const actionConfig = config[`${actionKind}_action`];
  const hasAction =
    actionConfig && typeof actionConfig === 'object' && Object.keys(actionConfig).length > 0;

  let action = hasAction ? actionConfig.action : undefined;

  if (!action) {
    if (actionKind === 'tap' && config.dropdown_on !== 'tap') {
      action = 'more-info';
    } else {
      return;
    }
  }

  if (action === 'none') return;

  const entityId = actionConfig?.entity || config.entity;

  switch (action) {
    case 'more-info': {
      node.dispatchEvent(
        new CustomEvent('hass-more-info', {
          bubbles: true,
          composed: true,
          detail: { entityId },
        })
      );
      return;
    }
    case 'toggle': {
      if (hass && entityId) {
        hass.callService('homeassistant', 'toggle', { entity_id: entityId });
      }
      return;
    }
    case 'perform-action':
    case 'call-service': {
      const servicePath = actionConfig?.perform_action || actionConfig?.service;
      if (!servicePath || !hass) return;
      const [domain, service] = servicePath.split('.');
      if (!domain || !service) return;
      hass.callService(domain, service, actionConfig.data || {}, actionConfig.target);
      return;
    }
    case 'navigate': {
      const path = actionConfig?.navigation_path;
      if (path === undefined || path === null) return;
      history.pushState(null, '', path);
      window.dispatchEvent(
        new CustomEvent('location-changed', {
          detail: { replace: !!actionConfig?.navigation_replace },
        })
      );
      return;
    }
    case 'url': {
      const url = actionConfig?.url_path;
      if (url) {
        window.open(url, '_blank');
      }
      return;
    }
    default:
      // assist and other unsupported actions are ignored silently
      return;
  }
}
