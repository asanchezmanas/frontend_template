// assets/js/modules/performance/index.js
/**
 * Performance Module
 * Monitor and optimize performance
 */

import { PerformanceMonitor } from './performance-monitor.js';

let instance = null;

export async function init() {
  if (instance) return instance;
  
  instance = new PerformanceMonitor({
    enabled: true,
    reportInterval: 30000, // 30 seconds
    trackLongTasks: true,
    trackResourceTiming: true
  });

  instance.init();
  return instance;
}

export { PerformanceMonitor };