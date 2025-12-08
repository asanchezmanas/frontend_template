// assets/js/modules/charts/index.js
/**
 * Charts Module
 * Wrapper for ApexCharts with presets
 */

import { ChartManager } from './chart-manager.js';

export async function init() {
  // Auto-initialize charts with data-chart attribute
  const charts = document.querySelectorAll('[data-chart]');
  
  const instances = [];
  for (const element of charts) {
    const config = JSON.parse(element.dataset.chart || '{}');
    const chart = await ChartManager.create(element, config);
    instances.push(chart);
  }

  console.log(`[Charts] Initialized ${instances.length} charts`);
  return instances;
}

export { ChartManager };