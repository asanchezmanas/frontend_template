/**
 * Main Application Entry Point
 * Orchestrates initialization of all modules after Alpine.js is ready
 */

import { App } from './core/app.js';

/**
 * Initialize theme manager first (before Alpine)
 * This ensures theme variables are applied before any components render
 */
async function initThemeManager() {
  try {
    const { themeManager } = await import('./modules/theme/manager.js');
    // Theme manager will auto-initialize itself
    console.log('✅ Theme manager loaded');
  } catch (error) {
    console.warn('⚠️ Theme manager not available:', error);
  }
}

// Initialize theme manager immediately
initThemeManager();

// Wait for Alpine to be initialized
document.addEventListener('alpine:init', async () => {
  console.log('Alpine.js initialized, starting application...');
  
  try {
    // Initialize core application
    await App.init();
    
    // Initialize charts if present on page
    if (shouldInitializeCharts()) {
      await initializeCharts();
    }
    
    // Initialize datatables if present on page
    if (shouldInitializeDatatables()) {
      await initializeDatatables();
    }
    
    // Initialize maps if present on page
    if (shouldInitializeMaps()) {
      await initializeMaps();
    }
    
    // Initialize date pickers if present on page
    if (shouldInitializeDatePickers()) {
      await initializeDatePickers();
    }
    
    // Initialize calendar if present on page
    if (shouldInitializeCalendar()) {
      await initializeCalendar();
    }
    
    console.log('Application initialized successfully');
    
  } catch (error) {
    console.error('Error initializing application:', error);
  }
});

/**
 * Check if charts should be initialized
 */
function shouldInitializeCharts() {
  return document.querySelector('[id^="chart"]') !== null;
}

/**
 * Initialize all charts on the page
 */
async function initializeCharts() {
  console.log('Initializing charts...');
  
  try {
    // Dynamically import ApexCharts library
    const ApexCharts = await import('https://cdn.jsdelivr.net/npm/apexcharts@3.45.1/dist/apexcharts.esm.js');
    window.ApexCharts = ApexCharts.default;
    
    // Import chart manager
    const { chartManager } = await import('./modules/charts/index.js');
    
    // Chart One - TailAdmin Bar Chart (Exact config from chart-01.js)
    if (document.getElementById('chartOne')) {
      chartManager.createTailAdminBarChart('#chartOne', {
        series: [{
          name: 'Sales',
          data: [168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112],
        }],
      });
    }
    
    // Chart Two - TailAdmin Radial Chart (Exact config from chart-02.js)
    if (document.getElementById('chartTwo')) {
      chartManager.createTailAdminRadialChart('#chartTwo', {
        series: [75.55],
      });
    }
    
    // Chart Three - TailAdmin Area Chart (Exact config from chart-03.js)
    if (document.getElementById('chartThree')) {
      chartManager.createTailAdminAreaChart('#chartThree', {
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
      });
    }
    
    // Store chart manager globally for access from other modules
    window.chartManager = chartManager;
    
    console.log('Charts initialized successfully');
    
  } catch (error) {
    console.error('Error initializing charts:', error);
  }
}

/**
 * Check if datatables should be initialized
 */
function shouldInitializeDatatables() {
  return document.querySelector('.data-table') !== null;
}

/**
 * Initialize datatables
 */
async function initializeDatatables() {
  console.log('Initializing datatables...');
  
  try {
    // Dynamically import DataTable module when needed
    const { DataTableManager } = await import('./modules/datatable/index.js');
    
    // Initialize all tables with class 'data-table'
    const tables = document.querySelectorAll('.data-table');
    tables.forEach((table, index) => {
      const tableId = table.id || `table-${index}`;
      DataTableManager.init(tableId, {
        pageLength: 10,
        responsive: true,
        order: [[0, 'asc']]
      });
    });
    
    console.log('Datatables initialized successfully');
    
  } catch (error) {
    console.error('Error initializing datatables:', error);
  }
}

/**
 * Check if maps should be initialized
 */
function shouldInitializeMaps() {
  return document.querySelector('[id^="map"]') !== null;
}

/**
 * Check if calendar should be initialized
 */
function shouldInitializeCalendar() {
  return document.getElementById('calendar') !== null;
}

/**
 * Initialize maps (for demographics component)
 */
async function initializeMaps() {
  console.log('Initializing maps...');
  
  try {
    // Dynamically import jsVectorMap library
    await import('https://cdn.jsdelivr.net/npm/jsvectormap@1.5.3/dist/js/jsvectormap.min.js');
    await import('https://cdn.jsdelivr.net/npm/jsvectormap@1.5.3/dist/maps/world.js');
    
    // Import CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/jsvectormap@1.5.3/dist/css/jsvectormap.min.css';
    document.head.appendChild(link);
    
    // Import map manager
    const { mapManager } = await import('./modules/maps/index.js');
    
    // Initialize mapOne with TailAdmin configuration
    if (document.getElementById('mapOne')) {
      mapManager.createTailAdminMapOne('#mapOne');
    }
    
    // Store map manager globally
    window.mapManager = mapManager;
    
    console.log('Maps initialized successfully');
    
  } catch (error) {
    console.error('Error initializing maps:', error);
  }
}

/**
 * Check if date pickers should be initialized
 */
function shouldInitializeDatePickers() {
  return document.querySelector('.datepicker') !== null || 
         document.querySelector('.chart-datepicker__input') !== null;
}

/**
 * Initialize date pickers
 */
async function initializeDatePickers() {
  console.log('Initializing date pickers...');
  
  try {
    // Dynamically import Flatpickr library
    const flatpickr = await import('https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/+esm');
    
    // Initialize all date picker inputs
    const datepickers = document.querySelectorAll('.datepicker, .chart-datepicker__input');
    
    datepickers.forEach(picker => {
      flatpickr.default(picker, {
        mode: 'range',
        dateFormat: 'M d, Y',
        defaultDate: [new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)],
        onChange: (selectedDates, dateStr) => {
          console.log('Date range selected:', dateStr);
          // Emit custom event for other components to listen
          picker.dispatchEvent(new CustomEvent('dateRangeChange', {
            detail: { dates: selectedDates, dateStr }
          }));
        }
      });
    });
    
    console.log('Date pickers initialized successfully');
    
  } catch (error) {
    console.error('Error initializing date pickers:', error);
  }
}

/**
 * Initialize calendar (FullCalendar for event management)
 */
async function initializeCalendar() {
  console.log('Initializing calendar...');
  
  try {
    // Dynamically import FullCalendar core
    const FullCalendar = await import('https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js');
    
    // Make FullCalendar globally available
    window.FullCalendar = FullCalendar.default || FullCalendar;
    
    // Import plugins
    window.FullCalendar.DayGridPlugin = (await import('https://cdn.jsdelivr.net/npm/@fullcalendar/daygrid@6.1.10/+esm')).default;
    window.FullCalendar.TimeGridPlugin = (await import('https://cdn.jsdelivr.net/npm/@fullcalendar/timegrid@6.1.10/+esm')).default;
    window.FullCalendar.ListPlugin = (await import('https://cdn.jsdelivr.net/npm/@fullcalendar/list@6.1.10/+esm')).default;
    window.FullCalendar.InteractionPlugin = (await import('https://cdn.jsdelivr.net/npm/@fullcalendar/interaction@6.1.10/+esm')).default;
    
    // Import calendar manager
    const { calendarManager } = await import('./modules/calendar/index.js');
    
    // Initialize calendar
    if (document.getElementById('calendar')) {
      calendarManager.initCalendar('#calendar');
    }
    
    // Store calendar manager globally
    window.calendarManager = calendarManager;
    
    console.log('Calendar initialized successfully');
    
  } catch (error) {
    console.error('Error initializing calendar:', error);
  }
}

/**
 * Export initialization functions for manual use if needed
 */
export {
  initializeCharts,
  initializeDatatables,
  initializeMaps,
  initializeDatePickers,
  initializeCalendar
};