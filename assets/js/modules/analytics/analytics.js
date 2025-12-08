// assets/js/modules/analytics/analytics.js
/**
 * Analytics Class
 * Complete analytics tracking system
 */

class Analytics {
  constructor(options = {}) {
    this.options = {
      enabled: true,
      debug: false,
      trackPageViews: true,
      trackClicks: true,
      trackScroll: false,
      sessionTimeout: 30 * 60 * 1000,
      endpoint: '/api/analytics',
      batchSize: 10,
      batchInterval: 30000, // 30 seconds
      ...options
    };

    this.sessionId = null;
    this.userId = null;
    this.eventQueue = [];
    this.batchTimer = null;
    this.scrollDepth = 0;
    this.timeOnPage = 0;
    this.pageStartTime = null;
  }

  async init() {
    if (!this.options.enabled) {
      this.log('Analytics disabled');
      return;
    }

    // Initialize session
    this.initSession();

    // Get or create user ID
    this.userId = this.getUserId();

    // Track page view
    if (this.options.trackPageViews) {
      this.trackPageView();
    }

    // Setup auto tracking
    this.setupAutoTracking();

    // Start batch processor
    this.startBatchProcessor();

    this.log('Analytics initialized', {
      sessionId: this.sessionId,
      userId: this.userId
    });
  }

  initSession() {
    const stored = sessionStorage.getItem('analytics_session');
    
    if (stored) {
      const session = JSON.parse(stored);
      const now = Date.now();
      
      // Check if session expired
      if (now - session.lastActivity < this.options.sessionTimeout) {
        this.sessionId = session.id;
        session.lastActivity = now;
        sessionStorage.setItem('analytics_session', JSON.stringify(session));
        return;
      }
    }

    // Create new session
    this.sessionId = this.generateId();
    sessionStorage.setItem('analytics_session', JSON.stringify({
      id: this.sessionId,
      startTime: Date.now(),
      lastActivity: Date.now()
    }));
  }

  getUserId() {
    let userId = localStorage.getItem('analytics_user_id');
    
    if (!userId) {
      userId = this.generateId();
      localStorage.setItem('analytics_user_id', userId);
    }

    return userId;
  }

  setupAutoTracking() {
    // Track clicks
    if (this.options.trackClicks) {
      document.addEventListener('click', (e) => {
        const target = e.target.closest('a, button');
        if (target) {
          this.trackClick(target);
        }
      });
    }

    // Track scroll depth
    if (this.options.trackScroll) {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            this.updateScrollDepth();
            ticking = false;
          });
          ticking = true;
        }
      });
    }

    // Track time on page
    this.pageStartTime = Date.now();
    
    window.addEventListener('beforeunload', () => {
      this.timeOnPage = Date.now() - this.pageStartTime;
      this.trackEvent('page_time', {
        duration: this.timeOnPage,
        scrollDepth: this.scrollDepth
      });
      this.flush(); // Send remaining events
    });

    // Track visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_hidden');
      } else {
        this.trackEvent('page_visible');
      }
    });
  }

  trackPageView(page = null) {
    const data = {
      page: page || this.getCurrentPage(),
      url: window.location.href,
      referrer: this.getReferrer(),
      utm: this.getUTMParams(),
      device: this.getDeviceInfo(),
      timestamp: Date.now()
    };

    this.track('pageview', data);
    this.log('Page view tracked', data);
  }

  trackEvent(eventName, data = {}) {
    const eventData = {
      event: eventName,
      ...data,
      timestamp: Date.now()
    };

    this.track('event', eventData);
    this.log('Event tracked', eventData);
  }

  trackClick(element) {
    const data = {
      element: element.tagName.toLowerCase(),
      text: element.textContent?.trim().substring(0, 100),
      href: element.href || null,
      id: element.id || null,
      classes: element.className || null,
      timestamp: Date.now()
    };

    this.track('click', data);
  }

  trackConversion(conversionName, value = null, data = {}) {
    const conversionData = {
      conversion: conversionName,
      value,
      ...data,
      timestamp: Date.now()
    };

    this.track('conversion', conversionData);
    this.log('Conversion tracked', conversionData);
  }

  track(type, data) {
    const event = {
      type,
      data,
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now()
    };

    this.eventQueue.push(event);

    // Send immediately if queue is full
    if (this.eventQueue.length >= this.options.batchSize) {
      this.flush();
    }
  }

  async flush() {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await this.sendEvents(events);
      this.log(`Sent ${events.length} events`);
    } catch (error) {
      console.error('Failed to send analytics:', error);
      // Re-queue events
      this.eventQueue.unshift(...events);
    }
  }

  async sendEvents(events) {
    if (!this.options.endpoint) return;

    const response = await fetch(this.options.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ events })
    });

    if (!response.ok) {
      throw new Error(`Analytics request failed: ${response.status}`);
    }
  }

  startBatchProcessor() {
    this.batchTimer = setInterval(() => {
      this.flush();
    }, this.options.batchInterval);
  }

  updateScrollDepth() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollPercent = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);

    if (scrollPercent > this.scrollDepth) {
      this.scrollDepth = scrollPercent;
      
      // Track milestones
      const milestones = [25, 50, 75, 100];
      const milestone = milestones.find(m => 
        this.scrollDepth >= m && scrollPercent >= m
      );
      
      if (milestone) {
        this.trackEvent('scroll_depth', { depth: milestone });
      }
    }
  }

  getCurrentPage() {
    return document.body.dataset.page || window.location.pathname;
  }

  getReferrer() {
    const referrer = document.referrer;
    if (!referrer) return 'direct';

    const url = new URL(referrer);
    
    // Check if same domain
    if (url.hostname === window.location.hostname) {
      return 'internal';
    }

    // Check if search engine
    const searchEngines = ['google', 'bing', 'yahoo', 'duckduckgo', 'baidu'];
    if (searchEngines.some(engine => url.hostname.includes(engine))) {
      return 'search';
    }

    // Check if social media
    const socialSites = ['facebook', 'twitter', 'linkedin', 'instagram', 'reddit'];
    if (socialSites.some(site => url.hostname.includes(site))) {
      return 'social';
    }

    return 'referral';
  }

  getUTMParams() {
    const params = new URLSearchParams(window.location.search);
    const utm = {};

    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(key => {
      const value = params.get(key);
      if (value) utm[key] = value;
    });

    return Object.keys(utm).length > 0 ? utm : null;
  }

  getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      screen: {
        width: window.screen.width,
        height: window.screen.height
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      touch: 'ontouchstart' in window,
      online: navigator.onLine
    };
  }

  generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  destroy() {
    this.flush();
    
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }
  }

  log(...args) {
    if (this.options.debug) {
      console.log('[Analytics]', ...args);
    }
  }
}

export { Analytics };