// assets/js/modules/analytics/index.js
/**
 * Analytics Module
 * Track user behavior and events
 */

import { Analytics } from './analytics.js';

let instance = null;

export async function init() {
  if (instance) return instance;
  
  instance = new Analytics({
    enabled: true,
    debug: false,
    trackPageViews: true,
    trackClicks: true,
    sessionTimeout: 30 * 60 * 1000 // 30 minutes
  });

  await instance.init();
  return instance;
}

export { Analytics };