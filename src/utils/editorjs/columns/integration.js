/**
 * Integration helper for Columns Block
 * Facilitates easy integration with admin.js and Editor.js
 */

import ColumnsBlock from './index.js';
import { ColumnsConfig, ColumnsUtils } from './config.js';

/**
 * Initialize the Columns Block plugin
 * @param {Object} options - Configuration options
 * @returns {Object} Plugin configuration for Editor.js
 */
export function initColumnsPlugin(options = {}) {
  // Load CSS automatically
      const cssPath = options.cssPath || '/src/utils/editorjs/columns/columns.css';
  ColumnsUtils.loadCSS(cssPath);
  
  // Merge options with defaults
  const config = {
    class: ColumnsBlock,
    config: {
      ...ColumnsConfig.defaultSettings,
      ...options.config
    }
  };
  
  return config;
}

/**
 * Get the Columns Block class for manual integration
 * @returns {Class} ColumnsBlock class
 */
export function getColumnsBlock() {
  return ColumnsBlock;
}

/**
 * Get configuration and utilities
 * @returns {Object} Configuration and utilities
 */
export function getColumnsConfig() {
  return { ColumnsConfig, ColumnsUtils };
}

/**
 * Preload required dependencies
 * @param {Object} options - Preload options
 */
export function preloadColumnsDependencies(options = {}) {
      const { cssPath = '/src/utils/editorjs/columns/columns.css' } = options;
  
  // Preload CSS
  ColumnsUtils.loadCSS(cssPath);
  
  // Optional: Preload any other assets
  if (options.preloadAssets) {
    options.preloadAssets.forEach(asset => {
      if (asset.type === 'css') {
        ColumnsUtils.loadCSS(asset.url);
      }
    });
  }
}

/**
 * Create a complete Editor.js configuration with Columns plugin
 * @param {Object} editorConfig - Existing Editor.js configuration
 * @param {Object} columnsOptions - Columns plugin options
 * @returns {Object} Updated Editor.js configuration
 */
export function createEditorConfigWithColumns(editorConfig = {}, columnsOptions = {}) {
  const columnsPlugin = initColumnsPlugin(columnsOptions);
  
  const updatedConfig = {
    ...editorConfig,
    tools: {
      ...editorConfig.tools,
      columns: columnsPlugin
    }
  };
  
  return updatedConfig;
}

/**
 * Validate if Editor.js environment is ready for Columns plugin
 * @returns {Object} Validation result
 */
export function validateEditorEnvironment() {
  const result = {
    ready: true,
    issues: []
  };
  
  // Check if EditorJS is available
  if (typeof window !== 'undefined' && !window.EditorJS) {
    result.ready = false;
    result.issues.push('Editor.js is not loaded');
  }
  
  // Check CSS Grid support
  if (typeof window !== 'undefined' && window.CSS && !CSS.supports('display', 'grid')) {
    result.ready = false;
    result.issues.push('CSS Grid is not supported in this browser');
  }
  
  // Check for required DOM APIs
  if (typeof document === 'undefined') {
    result.ready = false;
    result.issues.push('DOM is not available');
  }
  
  return result;
}

/**
 * Helper to create column layout data programmatically
 * @param {Object} options - Column creation options
 * @returns {Object} Column block data
 */
export function createColumnData(options = {}) {
  const {
    column1Content = '',
    column2Content = '',
    settings = ColumnsConfig.defaultSettings
  } = options;
  
  return {
    columns: [
      { content: column1Content, blocks: [] },
      { content: column2Content, blocks: [] }
    ],
    settings: ColumnsUtils.mergeWithDefaults(settings)
  };
}

/**
 * Export column data to various formats
 * @param {Object} columnData - Column block data
 * @param {string} format - Export format ('html', 'json', 'markdown')
 * @returns {string} Exported data
 */
export function exportColumnData(columnData, format = 'html') {
  switch (format.toLowerCase()) {
    case 'html':
      return exportToHTML(columnData);
    case 'json':
      return JSON.stringify(columnData, null, 2);
    case 'markdown':
      return exportToMarkdown(columnData);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Export column data to HTML
 * @param {Object} columnData - Column block data
 * @returns {string} HTML string
 */
function exportToHTML(columnData) {
  const { columns, settings } = columnData;
  const classes = ColumnsUtils.generateResponsiveClasses(settings);
  
  let html = `<div class="${classes.join(' ')}">`;
  
  columns.forEach((column, index) => {
    html += `<div class="cdx-column cdx-column-${index + 1}">`;
    html += `<div class="cdx-column-content">${column.content}</div>`;
    html += `</div>`;
  });
  
  html += `</div>`;
  
  return html;
}

/**
 * Export column data to Markdown
 * @param {Object} columnData - Column block data
 * @returns {string} Markdown string
 */
function exportToMarkdown(columnData) {
  const { columns } = columnData;
  
  let markdown = '## Columns\n\n';
  
  columns.forEach((column, index) => {
    markdown += `### Column ${index + 1}\n\n`;
    // Simple HTML to markdown conversion (basic)
    const content = column.content
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '\n\n')
      .replace(/<strong>/g, '**')
      .replace(/<\/strong>/g, '**')
      .replace(/<em>/g, '*')
      .replace(/<\/em>/g, '*')
      .replace(/<[^>]*>/g, ''); // Remove remaining HTML tags
    
    markdown += content + '\n\n';
  });
  
  return markdown;
}

/**
 * Import column data from HTML
 * @param {string} html - HTML string
 * @returns {Object} Column block data
 */
export function importFromHTML(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const container = doc.querySelector('.cdx-columns-container');
  
  if (!container) {
    throw new Error('Invalid HTML: no columns container found');
  }
  
  const columns = [];
  const columnElements = container.querySelectorAll('.cdx-column');
  
  columnElements.forEach(element => {
    const content = element.querySelector('.cdx-column-content');
    columns.push({
      content: content ? content.innerHTML : '',
      blocks: []
    });
  });
  
  // Extract settings from CSS classes (basic implementation)
  const settings = ColumnsUtils.cloneSettings(ColumnsConfig.defaultSettings);
  
  return {
    columns,
    settings
  };
}

/**
 * Plugin registration helper for multiple Editor.js instances
 */
export class ColumnsPluginManager {
  constructor() {
    this.instances = new Map();
    this.defaultOptions = {};
  }
  
  /**
   * Set default options for all instances
   * @param {Object} options - Default options
   */
  setDefaults(options) {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }
  
  /**
   * Register plugin for a specific editor instance
   * @param {string} instanceId - Editor instance ID
   * @param {Object} options - Instance-specific options
   */
  register(instanceId, options = {}) {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const pluginConfig = initColumnsPlugin(mergedOptions);
    
    this.instances.set(instanceId, {
      config: pluginConfig,
      options: mergedOptions
    });
    
    return pluginConfig;
  }
  
  /**
   * Get plugin configuration for instance
   * @param {string} instanceId - Editor instance ID
   * @returns {Object|null} Plugin configuration
   */
  get(instanceId) {
    const instance = this.instances.get(instanceId);
    return instance ? instance.config : null;
  }
  
  /**
   * Remove plugin registration for instance
   * @param {string} instanceId - Editor instance ID
   */
  unregister(instanceId) {
    return this.instances.delete(instanceId);
  }
  
  /**
   * Get all registered instances
   * @returns {Array} Array of instance IDs
   */
  getRegisteredInstances() {
    return Array.from(this.instances.keys());
  }
}

// Export default plugin manager instance
export const columnsPluginManager = new ColumnsPluginManager();

// Export everything for easy access
export default {
  ColumnsBlock,
  ColumnsConfig,
  ColumnsUtils,
  initColumnsPlugin,
  getColumnsBlock,
  getColumnsConfig,
  preloadColumnsDependencies,
  createEditorConfigWithColumns,
  validateEditorEnvironment,
  createColumnData,
  exportColumnData,
  importFromHTML,
  ColumnsPluginManager,
  columnsPluginManager
}; 