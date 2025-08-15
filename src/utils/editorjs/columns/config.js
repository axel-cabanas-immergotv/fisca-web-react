/**
 * Configuration and utilities for Columns Block
 */

export const ColumnsConfig = {
  // Dynamic default settings generator
  getDefaultSettings(numberOfColumns = 2) {
    const settings = {
      numberOfColumns: numberOfColumns,
      gutters: {}
    };
    
    // Create default settings for each breakpoint
    Object.keys(this.breakpoints).forEach(breakpoint => {
      settings[breakpoint] = {};
      
      // Default column distribution
      if (numberOfColumns === 2) {
        settings[breakpoint] = { col1: 9, col2: 3 };
      } else if (numberOfColumns === 3) {
        settings[breakpoint] = { col1: 4, col2: 4, col3: 4 };
      } else if (numberOfColumns === 4) {
        settings[breakpoint] = { col1: 3, col2: 3, col3: 3, col4: 3 };
      } else if (numberOfColumns === 5) {
        settings[breakpoint] = { col1: 2, col2: 2, col3: 2, col4: 3, col5: 3 };
      } else if (numberOfColumns === 6) {
        settings[breakpoint] = { col1: 2, col2: 2, col3: 2, col4: 2, col5: 2, col6: 2 };
      } else {
        // Equal distribution for any number of columns
        const colWidth = Math.floor(12 / numberOfColumns);
        const remainder = 12 % numberOfColumns;
        
        for (let i = 1; i <= numberOfColumns; i++) {
          settings[breakpoint][`col${i}`] = colWidth + (i <= remainder ? 1 : 0);
        }
      }
      
      // For small screens, stack columns (12 width each)
      if (breakpoint === 'sm' || breakpoint === 'xs') {
        for (let i = 1; i <= numberOfColumns; i++) {
          settings[breakpoint][`col${i}`] = 12;
        }
      }
    });
    
    // Default gutters for all columns
    for (let i = 1; i <= numberOfColumns; i++) {
      settings.gutters[`col${i}`] = 'default';
    }
    
    return settings;
  },

  // Legacy default settings for backward compatibility
  defaultSettings: {
    xl: { col1: 9, col2: 3 }, // Extra large devices (≥1470px)
    lg: { col1: 9, col2: 3 }, // Large devices (≥1200px)
    md: { col1: 9, col2: 3 }, // Medium devices (≥992px)
    sm: { col1: 12, col2: 12 }, // Small devices (≥768px)
    xs: { col1: 12, col2: 12 }, // Extra small devices (<768px)
    gutters: {
      col1: 'default',
      col2: 'default'
    }
  },

  // Breakpoint definitions
  breakpoints: {
    xl: {
      name: 'Extra large devices',
      description: 'Desktops (≥1470px)',
      minWidth: 1470
    },
    lg: {
      name: 'Large devices',
      description: 'Desktops (≥1200px)',
      minWidth: 1200
    },
    md: {
      name: 'Medium devices',
      description: 'Desktops (≥992px)',
      minWidth: 992
    },
    sm: {
      name: 'Small devices',
      description: 'Tablets (≥768px)',
      minWidth: 768
    },
    xs: {
      name: 'Extra small devices',
      description: 'Phones (<768px)',
      minWidth: 0
    }
  },

  // Number of columns options
  columnCountOptions: [
    { value: 2, label: '2 Columns' },
    { value: 3, label: '3 Columns' },
    { value: 4, label: '4 Columns' },
    { value: 5, label: '5 Columns' },
    { value: 6, label: '6 Columns' }
  ],

  // Gutter options
  gutterOptions: [
    { value: 'none', label: 'No Gutter', size: 0 },
    { value: 'small', label: 'Small', size: 8 },
    { value: 'default', label: 'Default', size: 16 },
    { value: 'large', label: 'Large', size: 24 }
  ],

  // CSS class prefixes
  cssClasses: {
    block: 'cdx-columns-block',
    container: 'cdx-columns-container',
    column: 'cdx-column',
    settings: 'cdx-columns-settings'
  },

  // Plugin metadata
  meta: {
    name: 'Columns',
    version: '1.0.0',
    author: 'Web Editor Team',
    description: 'Responsive column layouts for Editor.js with configurable breakpoints'
  }
};

/**
 * Utility functions for the Columns Block
 */
export const ColumnsUtils = {
  /**
   * Generate CSS grid template columns string for dynamic number of columns
   * @param {Object} columnSizes - Object with column sizes {col1: 6, col2: 3, col3: 3}
   * @param {number} numberOfColumns - Number of columns
   * @returns {string} CSS grid template columns value
   */
  generateGridTemplate(columnSizes, numberOfColumns) {
    // Check if all columns are 12 (stacked layout)
    const allStackedColumns = Object.values(columnSizes).every(size => size === 12);
    if (allStackedColumns) {
      return '1fr'; // Single column layout (stacked)
    }
    
    // Generate grid template based on column sizes
    const fractions = [];
    for (let i = 1; i <= numberOfColumns; i++) {
      const colKey = `col${i}`;
      fractions.push(`${columnSizes[colKey] || 1}fr`);
    }
    
    return fractions.join(' ');
  },

  /**
   * Validate column settings for dynamic columns
   * @param {Object} settings - Column settings object
   * @returns {boolean} True if valid
   */
  validateSettings(settings) {
    const breakpoints = Object.keys(ColumnsConfig.breakpoints);
    const numberOfColumns = settings.numberOfColumns || 2;
    
    for (const bp of breakpoints) {
      if (!settings[bp]) {
        return false;
      }
      
      // Check each column in the current breakpoint
      for (let i = 1; i <= numberOfColumns; i++) {
        const colKey = `col${i}`;
        if (!settings[bp][colKey]) {
          return false;
        }
        
        const colSize = parseInt(settings[bp][colKey]);
        if (colSize < 1 || colSize > 12) {
          return false;
        }
      }
      
      // Optional: Check if total doesn't exceed 12 (unless it's stacked)
      const total = Object.values(settings[bp]).reduce((sum, size) => sum + parseInt(size), 0);
      if (bp !== 'sm' && bp !== 'xs' && total > 12) {
        console.warn(`Total column width (${total}) exceeds 12 for breakpoint ${bp}`);
      }
    }
    
    return true;
  },

  /**
   * Generate responsive CSS classes for container
   * @param {Object} settings - Column settings
   * @returns {Array} Array of CSS class names
   */
  generateResponsiveClasses(settings) {
    const classes = [ColumnsConfig.cssClasses.container];
    
    Object.keys(ColumnsConfig.breakpoints).forEach(bp => {
      const col1 = settings[bp].col1;
      const col2 = settings[bp].col2;
      classes.push(`cdx-${bp}-${col1}-${col2}`);
    });
    
    // Add gutter classes
    const gutterClass = `cdx-gutter-${settings.gutters.col1}-${settings.gutters.col2}`;
    classes.push(gutterClass);
    
    return classes;
  },

  /**
   * Sanitize column content
   * @param {string} content - HTML content
   * @returns {string} Sanitized content
   */
  sanitizeContent(content) {
    // Basic HTML sanitization - remove scripts and dangerous elements
    const div = document.createElement('div');
    div.innerHTML = content;
    
    // Remove script tags
    const scripts = div.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    
    // Remove event handlers
    const elements = div.querySelectorAll('*');
    elements.forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        if (attr.name.startsWith('on')) {
          el.removeAttribute(attr.name);
        }
      });
    });
    
    return div.innerHTML;
  },

  /**
   * Deep clone settings object
   * @param {Object} settings - Settings to clone
   * @returns {Object} Cloned settings
   */
  cloneSettings(settings) {
    return JSON.parse(JSON.stringify(settings || ColumnsConfig.defaultSettings));
  },

  /**
   * Merge settings with defaults
   * @param {Object} userSettings - User provided settings
   * @returns {Object} Merged settings
   */
  mergeWithDefaults(userSettings) {
    const defaults = this.cloneSettings(ColumnsConfig.defaultSettings);
    
    if (!userSettings) return defaults;
    
    Object.keys(ColumnsConfig.breakpoints).forEach(bp => {
      if (userSettings[bp]) {
        defaults[bp] = { ...defaults[bp], ...userSettings[bp] };
      }
    });
    
    if (userSettings.gutters) {
      defaults.gutters = { ...defaults.gutters, ...userSettings.gutters };
    }
    
    return defaults;
  },

  /**
   * Generate column options HTML for select
   * @param {number} selected - Currently selected value
   * @returns {string} HTML options string
   */
  generateColumnOptions(selected = 12) {
    let options = '';
    for (let i = 1; i <= 12; i++) {
      const isSelected = i === selected ? 'selected' : '';
      options += `<option value="${i}" ${isSelected}>${i}</option>`;
    }
    return options;
  },

  /**
   * Generate gutter options HTML for select
   * @param {string} selected - Currently selected value
   * @returns {string} HTML options string
   */
  generateGutterOptions(selected = 'default') {
    return ColumnsConfig.gutterOptions.map(option => 
      `<option value="${option.value}" ${option.value === selected ? 'selected' : ''}>${option.label}</option>`
    ).join('');
  },

  /**
   * Check if device matches breakpoint
   * @param {string} breakpoint - Breakpoint key (xl, lg, md, sm, xs)
   * @returns {boolean} True if current device matches breakpoint
   */
  matchesBreakpoint(breakpoint) {
    const bp = ColumnsConfig.breakpoints[breakpoint];
    if (!bp) return false;
    
    const width = window.innerWidth;
    const nextBp = this.getNextBreakpoint(breakpoint);
    
    if (nextBp) {
      const nextWidth = ColumnsConfig.breakpoints[nextBp].minWidth;
      return width >= bp.minWidth && width < nextWidth;
    }
    
    return width >= bp.minWidth;
  },

  /**
   * Get next breakpoint in sequence
   * @param {string} current - Current breakpoint
   * @returns {string|null} Next breakpoint or null
   */
  getNextBreakpoint(current) {
    const sequence = ['xs', 'sm', 'md', 'lg', 'xl'];
    const index = sequence.indexOf(current);
    return index < sequence.length - 1 ? sequence[index + 1] : null;
  },

  /**
   * Get current active breakpoint
   * @returns {string} Active breakpoint key
   */
  getCurrentBreakpoint() {
    const width = window.innerWidth;
    
    if (width >= 1470) return 'xl';
    if (width >= 1200) return 'lg';
    if (width >= 992) return 'md';
    if (width >= 768) return 'sm';
    return 'xs';
  },

  /**
   * Load CSS if not already loaded
   * @param {string} cssPath - Path to CSS file
   */
  loadCSS(cssPath) {
    const existingLink = document.querySelector(`link[href="${cssPath}"]`);
    if (existingLink) return;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    document.head.appendChild(link);
  },

  /**
   * Format settings for export/save
   * @param {Object} settings - Settings object
   * @returns {Object} Formatted settings
   */
  formatForExport(settings) {
    const formatted = this.cloneSettings(settings);
    
    // Ensure all values are numbers for breakpoints
    Object.keys(ColumnsConfig.breakpoints).forEach(bp => {
      if (formatted[bp]) {
        formatted[bp].col1 = parseInt(formatted[bp].col1);
        formatted[bp].col2 = parseInt(formatted[bp].col2);
      }
    });
    
    return formatted;
  }
};

export default { ColumnsConfig, ColumnsUtils }; 