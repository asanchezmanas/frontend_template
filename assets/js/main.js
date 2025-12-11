/**
<<<<<<< HEAD
 * Main Application Entry Point
 * Orchestrates initialization of all modules after Alpine.js is ready
=======
 * Calendar Manager Module
 * Handles initialization of FullCalendar for event management
 * Based on TailAdmin's calendar-init.js
>>>>>>> origin/main
 */

/**
 * Calendar Manager Class
 */
class CalendarManager {
  constructor() {
    this.calendar = null;
    this.modalElements = null;
  }

<<<<<<< HEAD
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
=======
  /**
   * Get current dynamic month (01-12 format)
   */
  getDynamicMonth() {
    const month = new Date().getMonth() + 1;
    return month < 10 ? `0${month}` : `${month}`;
  }

  /**
   * Get current year
   */
  getCurrentYear() {
    return new Date().getFullYear();
  }

  /**
   * Initialize modal elements
   */
  initModalElements() {
    this.modalElements = {
      modal: document.getElementById('eventModal'),
      title: document.querySelector('#event-title'),
      startDate: document.querySelector('#event-start-date'),
      endDate: document.querySelector('#event-end-date'),
      addBtn: document.querySelector('.btn-add-event'),
      updateBtn: document.querySelector('.btn-update-event'),
    };

    // Verify all elements exist
    const missing = [];
    Object.keys(this.modalElements).forEach(key => {
      if (!this.modalElements[key]) {
        missing.push(key);
      }
    });

    if (missing.length > 0) {
      console.warn('Calendar modal elements missing:', missing);
      return false;
    }

    return true;
  }

  /**
   * Open modal
   */
  openModal() {
    if (this.modalElements && this.modalElements.modal) {
      this.modalElements.modal.style.display = 'flex';
    }
  }

  /**
   * Close modal
   */
  closeModal() {
    if (this.modalElements && this.modalElements.modal) {
      this.modalElements.modal.style.display = 'none';
      this.resetModalFields();
    }
  }

  /**
   * Reset modal fields
   */
  resetModalFields() {
    if (!this.modalElements) return;

    this.modalElements.title.value = '';
    this.modalElements.startDate.value = '';
    this.modalElements.endDate.value = '';
    
    const checkedRadio = document.querySelector('input[name="event-level"]:checked');
    if (checkedRadio) {
      checkedRadio.checked = false;
    }
  }

  /**
   * Handle calendar date selection
   */
  handleSelect(info) {
    this.resetModalFields();
    
    if (this.modalElements) {
      this.modalElements.addBtn.style.display = 'flex';
      this.modalElements.updateBtn.style.display = 'none';
      this.modalElements.startDate.value = info.startStr;
      this.modalElements.endDate.value = info.endStr || info.startStr;
      this.modalElements.title.value = '';
    }
    
    this.openModal();
  }

  /**
   * Handle add event button click
   */
  handleAddEvent() {
    const currentDate = new Date();
    const dd = String(currentDate.getDate()).padStart(2, '0');
    const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
    const yyyy = currentDate.getFullYear();
    const combineDate = `${yyyy}-${mm}-${dd}T00:00:00`;

    if (this.modalElements) {
      this.modalElements.addBtn.style.display = 'flex';
      this.modalElements.updateBtn.style.display = 'none';
      this.modalElements.startDate.value = combineDate;
    }
    
    this.openModal();
  }

  /**
   * Handle event click
   */
  handleEventClick(info) {
    const eventObj = info.event;

    if (eventObj.url) {
      window.open(eventObj.url);
      info.jsEvent.preventDefault();
    } else {
      const eventId = eventObj._def.publicId;
      const eventLevel = eventObj._def.extendedProps.calendar;
      const checkedRadio = document.querySelector(`input[value="${eventLevel}"]`);

      if (this.modalElements) {
        this.modalElements.title.value = eventObj.title;
        this.modalElements.startDate.value = eventObj.startStr.slice(0, 10);
        this.modalElements.endDate.value = eventObj.endStr ? eventObj.endStr.slice(0, 10) : '';
        
        if (checkedRadio) {
          checkedRadio.checked = true;
        }
        
        this.modalElements.updateBtn.dataset.fcEventPublicId = eventId;
        this.modalElements.addBtn.style.display = 'none';
        this.modalElements.updateBtn.style.display = 'block';
      }
      
      this.openModal();
    }
  }

  /**
   * Initialize FullCalendar with TailAdmin configuration
   */
  async initCalendar(selector, config = {}) {
    const element = document.querySelector(selector);
    
    if (!element) {
      console.warn(`Calendar element not found: ${selector}`);
      return null;
    }

    // Initialize modal elements
    const hasModal = this.initModalElements();

    // Load FullCalendar if not already loaded
    if (!window.FullCalendar) {
      console.error('FullCalendar library not loaded. Import it first.');
      return null;
    }

    // Calendar event categories
    const calendarsEvents = {
      Danger: 'danger',
      Success: 'success',
      Primary: 'primary',
      Warning: 'warning',
    };

    // Default events based on TailAdmin
    const newDate = new Date();
    const defaultEvents = [
      {
        id: 1,
        title: 'Event Conf.',
        start: `${this.getCurrentYear()}-${this.getDynamicMonth()}-01`,
        extendedProps: { calendar: 'Danger' },
      },
      {
        id: 2,
        title: 'Seminar #4',
        start: `${this.getCurrentYear()}-${this.getDynamicMonth()}-07`,
        end: `${this.getCurrentYear()}-${this.getDynamicMonth()}-10`,
        extendedProps: { calendar: 'Success' },
      },
      {
        groupId: '999',
        id: 3,
        title: 'Meeting #5',
        start: `${this.getCurrentYear()}-${this.getDynamicMonth()}-09T16:00:00`,
        extendedProps: { calendar: 'Primary' },
      },
      {
        groupId: '999',
        id: 4,
        title: 'Submission #1',
        start: `${this.getCurrentYear()}-${this.getDynamicMonth()}-16T16:00:00`,
        extendedProps: { calendar: 'Warning' },
      },
      {
        id: 5,
        title: 'Seminar #6',
        start: `${this.getCurrentYear()}-${this.getDynamicMonth()}-11`,
        end: `${this.getCurrentYear()}-${this.getDynamicMonth()}-13`,
        extendedProps: { calendar: 'Danger' },
      },
    ];

    // Default configuration
    const defaultConfig = {
      plugins: [
        window.FullCalendar.DayGridPlugin,
        window.FullCalendar.TimeGridPlugin,
        window.FullCalendar.ListPlugin,
        window.FullCalendar.InteractionPlugin
      ],
      selectable: true,
      initialView: 'dayGridMonth',
      initialDate: `${this.getCurrentYear()}-${this.getDynamicMonth()}-07`,
      headerToolbar: {
        left: 'prev,next addEventButton',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      events: defaultEvents,
      select: (info) => this.handleSelect(info),
      eventClick: (info) => this.handleEventClick(info),
      dateClick: () => this.handleAddEvent(),
      customButtons: {
        addEventButton: {
          text: 'Add Event +',
          click: () => this.handleAddEvent(),
        },
      },
      eventClassNames({ event: calendarEvent }) {
        const colorValue = calendarsEvents[calendarEvent._def.extendedProps.calendar];
        return ['event-fc-color', `fc-bg-${colorValue}`];
      },
    };

    // Merge configurations
    const finalConfig = { ...defaultConfig, ...config };

    try {
      // Create calendar instance
      this.calendar = new window.FullCalendar.Calendar(element, finalConfig);
      this.calendar.render();

      // Setup modal event listeners if modal exists
      if (hasModal) {
        this.setupModalListeners();
      }

      return this.calendar;
    } catch (error) {
      console.error('Error initializing calendar:', error);
      return null;
    }
  }

  /**
   * Setup modal event listeners
   */
  setupModalListeners() {
    if (!this.modalElements || !this.calendar) return;

    // Add event listener
    this.modalElements.addBtn.addEventListener('click', () => {
      const checkedRadio = document.querySelector('input[name="event-level"]:checked');
      const title = this.modalElements.title.value;
      const startDate = this.modalElements.startDate.value;
      const endDate = this.modalElements.endDate.value;
      const level = checkedRadio ? checkedRadio.value : '';

      this.calendar.addEvent({
        id: Date.now(),
        title: title,
        start: startDate,
        end: endDate,
        allDay: true,
        extendedProps: { calendar: level },
      });

      this.closeModal();
    });

    // Update event listener
    this.modalElements.updateBtn.addEventListener('click', () => {
      const eventId = this.modalElements.updateBtn.dataset.fcEventPublicId;
      const title = this.modalElements.title.value;
      const startDate = this.modalElements.startDate.value;
      const endDate = this.modalElements.endDate.value;
      const checkedRadio = document.querySelector('input[name="event-level"]:checked');
      const level = checkedRadio ? checkedRadio.value : '';

      const event = this.calendar.getEventById(eventId);
      if (event) {
        event.setProp('title', title);
        event.setDates(startDate, endDate);
        event.setExtendedProp('calendar', level);
      }

      this.closeModal();
    });

    // Close modal listeners
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => this.closeModal());
    });

    // Close on outside click
    window.addEventListener('click', (event) => {
      if (event.target === this.modalElements.modal) {
        this.closeModal();
      }
    });
  }

  /**
   * Get calendar instance
   */
  getCalendar() {
    return this.calendar;
  }

  /**
   * Destroy calendar
   */
  destroy() {
    if (this.calendar) {
      this.calendar.destroy();
      this.calendar = null;
    }
  }
}

// Export singleton instance
export const calendarManager = new CalendarManager();
>>>>>>> origin/main
