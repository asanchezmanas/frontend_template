/**
 * Chart Manager Module
 * Handles initialization and configuration of ApexCharts
 * Provides preset configurations for common chart types
 */

// TailAdmin Chart theme configurations (exact colors from TailAdmin)
const THEME_COLORS = {
  brand: '#465FFF',         // TailAdmin primary blue
  brandLight: '#9CB9FF',    // TailAdmin light blue
  brandDark: '#3651E0',     // TailAdmin dark blue
  success: 'hsl(142, 75%, 45%)',
  error: 'hsl(0, 85%, 62%)',
  warning: 'hsl(35, 95%, 58%)',
  gray: {
    50: 'hsl(220, 13%, 98%)',
    100: 'hsl(220, 12%, 96%)',
    200: 'hsl(220, 13%, 91%)',
    300: 'hsl(220, 11%, 84%)',
    400: 'hsl(220, 9%, 66%)',
    500: 'hsl(220, 9%, 50%)',
    600: 'hsl(220, 12%, 40%)',
    700: 'hsl(220, 16%, 30%)',
    800: 'hsl(220, 20%, 20%)',
    900: 'hsl(220, 24%, 12%)',
  }
};

// Base chart configuration
const BASE_CONFIG = {
  chart: {
    fontFamily: 'Inter, sans-serif',
    toolbar: {
      show: false
    },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
    }
  },
  dataLabels: {
    enabled: false
  },
  grid: {
    strokeDashArray: 5,
    borderColor: THEME_COLORS.gray[200],
  },
  tooltip: {
    theme: 'light',
    x: {
      show: true
    },
    y: {
      formatter: (val) => val?.toLocaleString() || '0'
    }
  }
};

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