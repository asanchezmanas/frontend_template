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
 * Chart Manager Class
 */
class ChartManager {
  constructor() {
    this.charts = new Map();
    this.isDarkMode = document.documentElement.classList.contains('dark');
    this.setupDarkModeObserver();
  }

  /**
   * Watch for dark mode changes
   */
  setupDarkModeObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const newDarkMode = document.documentElement.classList.contains('dark');
          if (newDarkMode !== this.isDarkMode) {
            this.isDarkMode = newDarkMode;
            this.updateAllCharts();
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  /**
   * Update all charts when theme changes
   */
  updateAllCharts() {
    this.charts.forEach((chart, id) => {
      const config = this.getThemeConfig();
      chart.updateOptions(config);
    });
  }

  /**
   * Get theme-specific configuration
   */
  getThemeConfig() {
    return {
      grid: {
        borderColor: this.isDarkMode ? THEME_COLORS.gray[800] : THEME_COLORS.gray[200],
      },
      xaxis: {
        labels: {
          style: {
            colors: this.isDarkMode ? THEME_COLORS.gray[400] : THEME_COLORS.gray[500]
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: this.isDarkMode ? THEME_COLORS.gray[400] : THEME_COLORS.gray[500]
          }
        }
      },
      tooltip: {
        theme: this.isDarkMode ? 'dark' : 'light'
      }
    };
  }

  /**
   * Create an area chart (line chart with filled area)
   */
  createAreaChart(selector, options = {}) {
    const defaultOptions = {
      series: [{
        name: 'Sales',
        data: [30, 40, 35, 50, 49, 60, 70, 91, 125, 100, 130, 150]
      }],
      chart: {
        ...BASE_CONFIG.chart,
        type: 'area',
        height: 350,
      },
      colors: [THEME_COLORS.brand],
      stroke: {
        curve: 'smooth',
        width: 2
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.5,
          opacityTo: 0.1,
          stops: [0, 100]
        }
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
      },
      yaxis: {
        title: {
          text: 'Revenue',
          style: {
            fontSize: '14px',
            fontWeight: 500,
          }
        },
        labels: {
          formatter: (val) => `$${(val / 1000).toFixed(0)}k`
        }
      },
      ...this.getThemeConfig()
    };

    const config = this.deepMerge(defaultOptions, options);
    return this.initChart(selector, config);
  }

  /**
   * Create a bar chart
   */
  createBarChart(selector, options = {}) {
    const defaultOptions = {
      series: [{
        name: 'Sales',
        data: [44, 55, 41, 67, 22, 43, 21, 33, 45, 31, 87, 65]
      }],
      chart: {
        ...BASE_CONFIG.chart,
        type: 'bar',
        height: 350,
      },
      colors: [THEME_COLORS.brand],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded',
          borderRadius: 4,
        },
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      },
      ...this.getThemeConfig()
    };

    const config = this.deepMerge(defaultOptions, options);
    return this.initChart(selector, config);
  }

  /**
   * Create a donut chart
   */
  createDonutChart(selector, options = {}) {
    const defaultOptions = {
      series: [44, 55, 13],
      chart: {
        ...BASE_CONFIG.chart,
        type: 'donut',
        height: 195,
      },
      colors: [THEME_COLORS.brand, THEME_COLORS.success, THEME_COLORS.warning],
      labels: ['Target', 'Revenue', 'Today'],
      plotOptions: {
        pie: {
          donut: {
            size: '75%',
            labels: {
              show: false
            }
          }
        }
      },
      legend: {
        show: false
      },
      ...this.getThemeConfig()
    };

    const config = this.deepMerge(defaultOptions, options);
    return this.initChart(selector, config);
  }

  /**
   * Create a line chart
   */
  createLineChart(selector, options = {}) {
    const defaultOptions = {
      series: [{
        name: 'Overview',
        data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30, 45]
      }],
      chart: {
        ...BASE_CONFIG.chart,
        type: 'line',
        height: 350,
      },
      colors: [THEME_COLORS.brand],
      stroke: {
        curve: 'smooth',
        width: 3
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      },
      markers: {
        size: 5,
        colors: [THEME_COLORS.brand],
        strokeColors: '#fff',
        strokeWidth: 2,
        hover: {
          size: 7,
        }
      },
      ...this.getThemeConfig()
    };

    const config = this.deepMerge(defaultOptions, options);
    return this.initChart(selector, config);
  }

  /**
   * Create TailAdmin Bar Chart (Chart One)
   * Exact configuration from chart-01.js
   */
  createTailAdminBarChart(selector, options = {}) {
    const defaultOptions = {
      series: [{
        name: 'Sales',
        data: [168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112],
      }],
      colors: [THEME_COLORS.brand],
      chart: {
        fontFamily: 'Outfit, sans-serif',
        type: 'bar',
        height: 180,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '39%',
          borderRadius: 5,
          borderRadiusApplication: 'end',
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 4,
        colors: ['transparent'],
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'left',
        fontFamily: 'Outfit',
        markers: {
          radius: 99,
        },
      },
      yaxis: {
        title: false,
      },
      grid: {
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        x: {
          show: false,
        },
        y: {
          formatter: function (val) {
            return val;
          },
        },
      },
      ...this.getThemeConfig()
    };

    const config = this.deepMerge(defaultOptions, options);
    return this.initChart(selector, config);
  }

  /**
   * Create TailAdmin Radial Chart (Chart Two)
   * Exact configuration from chart-02.js
   */
  createTailAdminRadialChart(selector, options = {}) {
    const defaultOptions = {
      series: [75.55],
      colors: [THEME_COLORS.brand],
      chart: {
        fontFamily: 'Outfit, sans-serif',
        type: 'radialBar',
        height: 330,
        sparkline: {
          enabled: true,
        },
      },
      plotOptions: {
        radialBar: {
          startAngle: -90,
          endAngle: 90,
          hollow: {
            size: '80%',
          },
          track: {
            background: this.isDarkMode ? THEME_COLORS.gray[800] : '#E4E7EC',
            strokeWidth: '100%',
            margin: 5,
          },
          dataLabels: {
            name: {
              show: false,
            },
            value: {
              fontSize: '36px',
              fontWeight: '600',
              offsetY: 60,
              color: this.isDarkMode ? '#fff' : '#1D2939',
              formatter: function (val) {
                return val + '%';
              },
            },
          },
        },
      },
      fill: {
        type: 'solid',
        colors: [THEME_COLORS.brand],
      },
      stroke: {
        lineCap: 'round',
      },
      labels: ['Progress'],
    };

    const config = this.deepMerge(defaultOptions, options);
    return this.initChart(selector, config);
  }

  /**
   * Create TailAdmin Area Chart (Chart Three)
   * Exact configuration from chart-03.js
   */
  createTailAdminAreaChart(selector, options = {}) {
    const defaultOptions = {
      series: [
        {
          name: 'Sales',
          data: [180, 190, 170, 160, 175, 165, 170, 205, 230, 210, 240, 235],
        },
        {
          name: 'Revenue',
          data: [40, 30, 50, 40, 55, 40, 70, 100, 110, 120, 150, 140],
        },
      ],
      legend: {
        show: false,
        position: 'top',
        horizontalAlign: 'left',
      },
      colors: [THEME_COLORS.brand, THEME_COLORS.brandLight],
      chart: {
        fontFamily: 'Outfit, sans-serif',
        height: 310,
        type: 'area',
        toolbar: {
          show: false,
        },
      },
      fill: {
        gradient: {
          enabled: true,
          opacityFrom: 0.55,
          opacityTo: 0,
        },
      },
      stroke: {
        curve: 'straight',
        width: [2, 2],
      },
      markers: {
        size: 0,
      },
      labels: {
        show: false,
        position: 'top',
      },
      grid: {
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
        borderColor: this.isDarkMode ? THEME_COLORS.gray[800] : THEME_COLORS.gray[200],
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        theme: this.isDarkMode ? 'dark' : 'light',
        x: {
          format: 'dd MMM yyyy',
        },
      },
      xaxis: {
        type: 'category',
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        tooltip: false,
        labels: {
          style: {
            colors: this.isDarkMode ? THEME_COLORS.gray[400] : THEME_COLORS.gray[500]
          }
        }
      },
      yaxis: {
        title: {
          style: {
            fontSize: '0px',
          },
        },
        labels: {
          style: {
            colors: this.isDarkMode ? THEME_COLORS.gray[400] : THEME_COLORS.gray[500]
          }
        }
      },
    };

    const config = this.deepMerge(defaultOptions, options);
    return this.initChart(selector, config);
  }

  /**
   * Initialize a chart with given configuration
   */
  initChart(selector, config) {
    const element = document.querySelector(selector);
    
    if (!element) {
      console.warn(`Chart element not found: ${selector}`);
      return null;
    }

    // Clear existing chart if present
    if (this.charts.has(selector)) {
      this.charts.get(selector).destroy();
    }

    // Create new chart
    const chart = new ApexCharts(element, config);
    chart.render();
    
    // Store reference
    this.charts.set(selector, chart);
    
    return chart;
  }

  /**
   * Update chart data
   */
  updateChart(selector, newData) {
    const chart = this.charts.get(selector);
    if (chart) {
      chart.updateSeries(newData);
    }
  }

  /**
   * Destroy a chart
   */
  destroyChart(selector) {
    const chart = this.charts.get(selector);
    if (chart) {
      chart.destroy();
      this.charts.delete(selector);
    }
  }

  /**
   * Destroy all charts
   */
  destroyAll() {
    this.charts.forEach(chart => chart.destroy());
    this.charts.clear();
  }

  /**
   * Deep merge utility for configuration objects
   */
  deepMerge(target, source) {
    const output = { ...target };
    
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    
    return output;
  }

  /**
   * Check if value is an object
   */
  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  /**
   * Preset configurations for quick chart creation
   */
  createPreset(type, selector, customOptions = {}) {
    const presets = {
      // Generic presets
      'area': () => this.createAreaChart(selector, customOptions),
      'bar': () => this.createBarChart(selector, customOptions),
      'donut': () => this.createDonutChart(selector, customOptions),
      'line': () => this.createLineChart(selector, customOptions),
      
      // TailAdmin-specific presets (exact configs)
      'tailadmin-bar': () => this.createTailAdminBarChart(selector, customOptions),
      'tailadmin-radial': () => this.createTailAdminRadialChart(selector, customOptions),
      'tailadmin-area': () => this.createTailAdminAreaChart(selector, customOptions),
    };

    const createFn = presets[type];
    if (!createFn) {
      console.error(`Unknown chart preset: ${type}`);
      return null;
    }

    return createFn();
  }
}

// Export singleton instance
export const chartManager = new ChartManager();
export { THEME_COLORS };
