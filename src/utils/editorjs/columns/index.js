/**
 * Columns Block for Editor.js
 * Creates responsive column layouts with configurable breakpoints
 */
class ColumnsBlock {
  static get toolbox() {
    return {
      title: 'Columns',
      icon: '<svg width="17" height="15" viewBox="0 0 17 15" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h7v15H0V0zm10 0h7v15h-7V0z" fill="currentColor"/></svg>'
    };
  }

  static get isReadOnlySupported() {
    return true;
  }

  constructor({ data, api, readOnly }) {
    this.api = api;
    this.readOnly = readOnly;
    this.data = {
      columns: data.columns || [
        { content: '', blocks: [] },
        { content: '', blocks: [] }
      ],
      settings: data.settings || {
        xl: { col1: 9, col2: 3 }, // Extra large devices (≥1470px)
        lg: { col1: 9, col2: 3 }, // Large devices (≥1200px)
        md: { col1: 9, col2: 3 }, // Medium devices (≥992px)
        sm: { col1: 12, col2: 12 }, // Small devices (≥768px)
        xs: { col1: 12, col2: 12 }, // Extra small devices (<768px)
        gutters: {
          col1: 'default',
          col2: 'default'
        }
      }
    };
    
    this.wrapper = null;
    this.settingsOpened = false;
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('cdx-columns-block');
    
    // Create columns container
    const columnsContainer = document.createElement('div');
    columnsContainer.classList.add('cdx-columns-container');
    this.updateColumnClasses(columnsContainer);
    
    // Create individual columns
    this.data.columns.forEach((column, index) => {
      const columnElement = this.createColumnElement(column, index);
      columnsContainer.appendChild(columnElement);
    });
    
    // Create settings panel
    const settingsPanel = this.createSettingsPanel();
    
    this.wrapper.appendChild(settingsPanel);
    this.wrapper.appendChild(columnsContainer);
    
    return this.wrapper;
  }

  createColumnElement(column, index) {
    const columnDiv = document.createElement('div');
    columnDiv.classList.add('cdx-column', `cdx-column-${index + 1}`);
    
    const columnHeader = document.createElement('div');
    columnHeader.classList.add('cdx-column-header');
    columnHeader.innerHTML = `<span>Column ${index + 1}</span>`;
    
    const columnContent = document.createElement('div');
    columnContent.classList.add('cdx-column-content');
    columnContent.contentEditable = !this.readOnly;
    columnContent.innerHTML = column.content || `<p>Click here to edit column ${index + 1} content...</p>`;
    
    // Add event listeners for content editing
    if (!this.readOnly) {
      columnContent.addEventListener('input', () => {
        this.data.columns[index].content = columnContent.innerHTML;
      });
      
      columnContent.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
      });
    }
    
    columnDiv.appendChild(columnHeader);
    columnDiv.appendChild(columnContent);
    
    return columnDiv;
  }

  createSettingsPanel() {
    const settingsPanel = document.createElement('div');
    settingsPanel.classList.add('cdx-columns-settings');
    
    const settingsToggle = document.createElement('button');
    settingsToggle.classList.add('cdx-settings-toggle');
    settingsToggle.innerHTML = '⚙️ Row Settings';
    settingsToggle.addEventListener('click', () => {
      this.toggleSettings();
    });
    
    const settingsContent = document.createElement('div');
    settingsContent.classList.add('cdx-settings-content');
    settingsContent.style.display = 'none';
    
    // Create settings form
    settingsContent.innerHTML = this.createSettingsHTML();
    
    // Add event listeners for settings
    this.attachSettingsListeners(settingsContent);
    
    settingsPanel.appendChild(settingsToggle);
    settingsPanel.appendChild(settingsContent);
    
    return settingsPanel;
  }

  createSettingsHTML() {
    const { settings } = this.data;
    
    return `
      <div class="cdx-settings-form">
        <div class="cdx-settings-tabs">
          <button class="cdx-tab-btn active" data-tab="columns">Columns Setting</button>
          <button class="cdx-tab-btn" data-tab="properties">Properties</button>
        </div>
        
        <div class="cdx-tab-content" id="columns-tab">
          <div class="cdx-breakpoint-settings">
            <div class="cdx-columns-header">
              <div class="cdx-device-label"></div>
              <div class="cdx-column-label">Column 1</div>
              <div class="cdx-column-label">Column 2</div>
            </div>
            
            <div class="cdx-setting-row">
              <label>Extra large devices<br>Desktops (≥1470px)</label>
              <select name="xl_col1" data-breakpoint="xl" data-column="col1">
                ${this.generateColumnOptions(settings.xl.col1)}
              </select>
              <select name="xl_col2" data-breakpoint="xl" data-column="col2">
                ${this.generateColumnOptions(settings.xl.col2)}
              </select>
            </div>
            
            <div class="cdx-setting-row">
              <label>Large devices<br>Desktops (≥1200px)</label>
              <select name="lg_col1" data-breakpoint="lg" data-column="col1">
                ${this.generateColumnOptions(settings.lg.col1)}
              </select>
              <select name="lg_col2" data-breakpoint="lg" data-column="col2">
                ${this.generateColumnOptions(settings.lg.col2)}
              </select>
            </div>
            
            <div class="cdx-setting-row">
              <label>Medium devices<br>Desktops (≥992px)</label>
              <select name="md_col1" data-breakpoint="md" data-column="col1">
                ${this.generateColumnOptions(settings.md.col1)}
              </select>
              <select name="md_col2" data-breakpoint="md" data-column="col2">
                ${this.generateColumnOptions(settings.md.col2)}
              </select>
            </div>
            
            <div class="cdx-setting-row">
              <label>Small devices<br>Tablets (≥768px)</label>
              <select name="sm_col1" data-breakpoint="sm" data-column="col1">
                ${this.generateColumnOptions(settings.sm.col1)}
              </select>
              <select name="sm_col2" data-breakpoint="sm" data-column="col2">
                ${this.generateColumnOptions(settings.sm.col2)}
              </select>
            </div>
            
            <div class="cdx-setting-row">
              <label>Extra small devices<br>Phones (<768px)</label>
              <select name="xs_col1" data-breakpoint="xs" data-column="col1">
                ${this.generateColumnOptions(settings.xs.col1)}
              </select>
              <select name="xs_col2" data-breakpoint="xs" data-column="col2">
                ${this.generateColumnOptions(settings.xs.col2)}
              </select>
            </div>
            
            <div class="cdx-setting-row">
              <label>Gutter</label>
              <select name="gutter_col1" data-setting="gutters" data-column="col1">
                ${this.generateGutterOptions(settings.gutters.col1)}
              </select>
              <select name="gutter_col2" data-setting="gutters" data-column="col2">
                ${this.generateGutterOptions(settings.gutters.col2)}
              </select>
            </div>
          </div>
          
          <div class="cdx-settings-actions">
            <button class="cdx-btn-primary" id="edit-row">EDIT ROW</button>
            <button class="cdx-btn-secondary" id="cancel-settings">CANCEL</button>
          </div>
        </div>
        
        <div class="cdx-tab-content" id="properties-tab" style="display: none;">
          <p>Additional properties can be configured here.</p>
        </div>
      </div>
    `;
  }

  generateColumnOptions(selected) {
    let options = '';
    for (let i = 1; i <= 12; i++) {
      options += `<option value="${i}" ${i === selected ? 'selected' : ''}>${i}</option>`;
    }
    return options;
  }

  generateGutterOptions(selected) {
    const gutterOptions = [
      { value: 'none', label: 'No Gutter' },
      { value: 'small', label: 'Small' },
      { value: 'default', label: 'Default' },
      { value: 'large', label: 'Large' }
    ];
    
    return gutterOptions.map(option => 
      `<option value="${option.value}" ${option.value === selected ? 'selected' : ''}>${option.label}</option>`
    ).join('');
  }

  attachSettingsListeners(settingsContent) {
    // Tab switching
    const tabButtons = settingsContent.querySelectorAll('.cdx-tab-btn');
    const tabContents = settingsContent.querySelectorAll('.cdx-tab-content');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.style.display = 'none');
        
        button.classList.add('active');
        const tabId = button.dataset.tab + '-tab';
        document.getElementById(tabId).style.display = 'block';
      });
    });

    // Column settings
    const selects = settingsContent.querySelectorAll('select[data-breakpoint]');
    selects.forEach(select => {
      select.addEventListener('change', (e) => {
        const breakpoint = e.target.dataset.breakpoint;
        const column = e.target.dataset.column;
        const value = parseInt(e.target.value);
        
        this.data.settings[breakpoint][column] = value;
        this.updateColumnClasses(this.wrapper.querySelector('.cdx-columns-container'));
      });
    });

    // Gutter settings
    const gutterSelects = settingsContent.querySelectorAll('select[data-setting="gutters"]');
    gutterSelects.forEach(select => {
      select.addEventListener('change', (e) => {
        const column = e.target.dataset.column;
        const value = e.target.value;
        
        this.data.settings.gutters[column] = value;
        this.updateColumnClasses(this.wrapper.querySelector('.cdx-columns-container'));
      });
    });

    // Action buttons
    const editButton = settingsContent.querySelector('#edit-row');
    const cancelButton = settingsContent.querySelector('#cancel-settings');
    
    editButton.addEventListener('click', () => {
      this.toggleSettings();
    });
    
    cancelButton.addEventListener('click', () => {
      this.toggleSettings();
    });
  }

  updateColumnClasses(container) {
    if (!container) return;
    
    const { settings } = this.data;
    container.className = 'cdx-columns-container';
    
    // Add responsive classes
    container.classList.add(
      `cdx-xl-${settings.xl.col1}-${settings.xl.col2}`,
      `cdx-lg-${settings.lg.col1}-${settings.lg.col2}`,
      `cdx-md-${settings.md.col1}-${settings.md.col2}`,
      `cdx-sm-${settings.sm.col1}-${settings.sm.col2}`,
      `cdx-xs-${settings.xs.col1}-${settings.xs.col2}`,
      `cdx-gutter-${settings.gutters.col1}-${settings.gutters.col2}`
    );
  }

  toggleSettings() {
    const settingsContent = this.wrapper.querySelector('.cdx-settings-content');
    this.settingsOpened = !this.settingsOpened;
    settingsContent.style.display = this.settingsOpened ? 'block' : 'none';
  }

  save() {
    return this.data;
  }

  static get sanitize() {
    return {
      columns: {},
      settings: {}
    };
  }
}

export default ColumnsBlock; 