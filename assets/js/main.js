/**
 * Calendar Manager Module
 * Handles initialization of FullCalendar for event management
 * Based on TailAdmin's calendar-init.js
 */

/**
 * Calendar Manager Class
 */
class CalendarManager {
  constructor() {
    this.calendar = null;
    this.modalElements = null;
  }

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
