// assets/js/modules/charts/chart-manager.js
/**
 * Chart Manager Class
 * ApexCharts wrapper with theme support and presets
 */

// Import ApexCharts from CDN (via import map in HTML)
import ApexCharts from 'apexcharts';

class ChartManager {
  static instances = new Map();

  static async create(element, config = {}) {
    const container = typeof element === 'string' 
      ? document.querySelector(element) 
      : element;

    if (!container) {
      throw new Error('Chart container not found');
    }

    const chartId = config.id || `chart_${Date.now()}`;
    
    // Get chart configuration
    const chartConfig = this.buildConfig(config);
    
    // Create chart instance
    const chart = new ApexCharts(container, chartConfig);
    await chart.render();

    // Store instance
    this.instances.set(chartId, {
      chart,
      container,
      config: chartConfig
    });

    // Listen for theme changes
    this.watchTheme(chartId);

    console.log(`[Chart] Created: ${chartId}`);
    return chart;
  }

  static buildConfig(config) {
    const theme = this.getTheme();
    const baseConfig = this.getBaseConfig(theme);

    // Merge with user config
    return this.deepMerge(baseConfig, config);
  }

  static getBaseConfig(theme) {
    const isDark = theme === 'dark';

    return {
      chart: {
        fontFamily: 'Inter, sans-serif',
        foreColor: isDark ? '#d1d5db' : '#374151',
        background: 'transparent',
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true
          }
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        }
      },
      theme: {
        mode: isDark ? 'dark' : 'light'
      },
      colors: [
        '#3b82f6', // blue-500
        '#10b981', // green-500
        '#f59e0b', // amber-500
        '#ef4444', // red-500
        '#8b5cf6', // purple-500
        '#ec4899', // pink-500
        '#14b8a6', // teal-500
        '#f97316'  // orange-500
      ],
      grid: {
        borderColor: isDark ? '#374151' : '#e5e7eb',
        strokeDashArray: 3
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      tooltip: {
        theme: isDark ? 'dark' : 'light'
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center'
      },
      xaxis: {
        labels: {
          style: {
            colors: isDark ? '#9ca3af' : '#6b7280'
          }
        },
        axisBorder: {
          color: isDark ? '#374151' : '#e5e7eb'
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: isDark ? '#9ca3af' : '#6b7280'
          }
        }
      }
    };
  }

  static getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  static watchTheme(chartId) {
    const observer = new MutationObserver(() => {
      this.updateChartTheme(chartId);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }

  static updateChartTheme(chartId) {
    const instance = this.instances.get(chartId);
    if (!instance) return;

    const theme = this.getTheme();
    const isDark = theme === 'dark';

    instance.chart.updateOptions({
      theme: {
        mode: isDark ? 'dark' : 'light'
      },
      chart: {
        foreColor: isDark ? '#d1d5db' : '#374151'
      },
      grid: {
        borderColor: isDark ? '#374151' : '#e5e7eb'
      },
      tooltip: {
        theme: isDark ? 'dark' : 'light'
      }
    });
  }

  static deepMerge(target, source) {
    const output = { ...target };
    
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            output[key] = source[key];
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          output[key] = source[key];
        }
      });
    }

    return output;
  }

  static isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  // Preset configurations
  static presets = {
    line: (data) => ({
      chart: {
        type: 'line',
        height: 350
      },
      series: data.series || [],
      xaxis: {
        categories: data.categories || []
      }
    }),

    area: (data) => ({
      chart: {
        type: 'area',
        height: 350
      },
      series: data.series || [],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3
        }
      },
      xaxis: {
        categories: data.categories || []
      }
    }),

    bar: (data) => ({
      chart: {
        type: 'bar',
        height: 350
      },
      series: data.series || [],
      plotOptions: {
        bar: {
          horizontal: data.horizontal || false,
          columnWidth: '55%',
          borderRadius: 4
        }
      },
      xaxis: {
        categories: data.categories || []
      }
    }),

    donut: (data) => ({
      chart: {
        type: 'donut',
        height: 350
      },
      series: data.series || [],
      labels: data.labels || [],
      plotOptions: {
        pie: {
          donut: {
            size: '70%'
          }
        }
      }
    }),

    radialBar: (data) => ({
      chart: {
        type: 'radialBar',
        height: 350
      },
      series: data.series || [],
      labels: data.labels || [],
      plotOptions: {
        radialBar: {
          hollow: {
            size: '70%'
          },
          dataLabels: {
            show: true,
            name: {
              show: true
            },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 600
            }
          }
        }
      }
    }),

    sparkline: (data) => ({
      chart: {
        type: 'line',
        height: 80,
        sparkline: {
          enabled: true
        }
      },
      series: [{
        data: data.values || []
      }],
      stroke: {
        curve: 'smooth',
        width: 3
      },
      tooltip: {
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        marker: {
          show: false
        }
      }
    }),

    heatmap: (data) => ({
      chart: {
        type: 'heatmap',
        height: 350
      },
      series: data.series || [],
      plotOptions: {
        heatmap: {
          radius: 2,
          colorScale: {
            ranges: data.ranges || []
          }
        }
      },
      xaxis: {
        categories: data.categories || []
      }
    })
  };

  static createPreset(type, element, data) {
    const preset = this.presets[type];
    if (!preset) {
      throw new Error(`Unknown preset type: ${type}`);
    }

    const config = preset(data);
    return this.create(element, config);
  }

  static update(chartId, options) {
    const instance = this.instances.get(chartId);
    if (!instance) return;

    instance.chart.updateOptions(options);
  }

  static updateSeries(chartId, newSeries) {
    const instance = this.instances.get(chartId);
    if (!instance) return;

    instance.chart.updateSeries(newSeries);
  }

  static destroy(chartId) {
    const instance = this.instances.get(chartId);
    if (!instance) return;

    instance.chart.destroy();
    this.instances.delete(chartId);
  }

  static destroyAll() {
    this.instances.forEach((instance, id) => {
      instance.chart.destroy();
    });
    this.instances.clear();
  }
}

export { ChartManager };