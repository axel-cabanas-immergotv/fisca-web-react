/**
 * Columns Block for Editor.js - Global Version
 * This version works as a traditional script without ES6 modules
 */
(function(window) {
    'use strict';

    /**
     * Configuration for Columns Block
     */
    const ColumnsConfig = {
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

        breakpoints: {
            xl: { name: 'Extra large devices', description: 'Desktops (≥1470px)', minWidth: 1470 },
            lg: { name: 'Large devices', description: 'Desktops (≥1200px)', minWidth: 1200 },
            md: { name: 'Medium devices', description: 'Desktops (≥992px)', minWidth: 992 },
            sm: { name: 'Small devices', description: 'Tablets (≥768px)', minWidth: 768 },
            xs: { name: 'Extra small devices', description: 'Phones (<768px)', minWidth: 0 }
        },

        // Number of columns options
        columnCountOptions: [
            { value: 2, label: '2 Columns' },
            { value: 3, label: '3 Columns' },
            { value: 4, label: '4 Columns' },
            { value: 5, label: '5 Columns' },
            { value: 6, label: '6 Columns' }
        ],

        gutterOptions: [
            { value: 'none', label: 'No Gutter', size: 0 },
            { value: 'small', label: 'Small', size: 8 },
            { value: 'default', label: 'Default', size: 16 },
            { value: 'large', label: 'Large', size: 24 }
        ],

        // Dynamic default settings generator
        getDefaultSettings: function(numberOfColumns = 2) {
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
        }
    };

    /**
     * Utility functions
     */
    const ColumnsUtils = {
        generateColumnOptions: function(selected = 12) {
            let options = '';
            for (let i = 1; i <= 12; i++) {
                options += `<option value="${i}" ${i === selected ? 'selected' : ''}>${i}</option>`;
            }
            return options;
        },

        generateGutterOptions: function(selected = 'default') {
            return ColumnsConfig.gutterOptions.map(option => 
                `<option value="${option.value}" ${option.value === selected ? 'selected' : ''}>${option.label}</option>`
            ).join('');
        },

        cloneSettings: function(settings) {
            return JSON.parse(JSON.stringify(settings || ColumnsConfig.defaultSettings));
        },

        mergeWithDefaults: function(userSettings) {
            // Use dynamic settings based on number of columns
            const numberOfColumns = userSettings?.numberOfColumns || 2;
            const defaults = this.cloneSettings(ColumnsConfig.getDefaultSettings(numberOfColumns));
            
            if (!userSettings) return defaults;
            
            // Preserve numberOfColumns
            if (userSettings.numberOfColumns) {
                defaults.numberOfColumns = userSettings.numberOfColumns;
            }
            
            Object.keys(ColumnsConfig.breakpoints).forEach(bp => {
                if (userSettings[bp]) {
                    defaults[bp] = Object.assign({}, defaults[bp], userSettings[bp]);
                }
            });
            
            if (userSettings.gutters) {
                defaults.gutters = Object.assign({}, defaults.gutters, userSettings.gutters);
            }
            
            return defaults;
        },

        generateGridTemplate: function(columnSizes, numberOfColumns) {
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

        validateSettings: function(settings) {
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
        }
    };

    /**
     * Main Columns Block Class
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
            
            // Get number of columns from existing data or default to 2
            const numberOfColumns = data.settings?.numberOfColumns || 2;
            
            // Generate default settings for the specified number of columns
            const defaultSettings = ColumnsConfig.getDefaultSettings(numberOfColumns);
            
            this.data = {
                columns: data.columns || this.generateDefaultColumns(numberOfColumns),
                settings: ColumnsUtils.mergeWithDefaults(data.settings) || defaultSettings
            };
            
            // Ensure we have the correct number of columns
            this.ensureCorrectColumnCount();
            
            this.wrapper = null;
            this.columnEditors = []; // Array to store Editor.js instances for each column
        }

        generateDefaultColumns(numberOfColumns) {
            const columns = [];
            for (let i = 0; i < numberOfColumns; i++) {
                columns.push({ content: '', blocks: [] });
            }
            return columns;
        }

        ensureCorrectColumnCount() {
            const numberOfColumns = this.data.settings.numberOfColumns || 2;
            const currentColumns = this.data.columns.length;
            
            console.log(`🔧 ensureCorrectColumnCount: Need ${numberOfColumns}, have ${currentColumns}`);
            
            if (currentColumns < numberOfColumns) {
                // Add missing columns
                const toAdd = numberOfColumns - currentColumns;
                console.log(`➕ Adding ${toAdd} missing columns`);
                for (let i = currentColumns; i < numberOfColumns; i++) {
                    this.data.columns.push({ content: '', blocks: [] });
                    console.log(`✅ Added column ${i + 1}`);
                }
            } else if (currentColumns > numberOfColumns) {
                // Remove extra columns (preserve data temporarily)
                const toRemove = currentColumns - numberOfColumns;
                console.log(`➖ Removing ${toRemove} extra columns (preserving data)`);
                this.data.columns = this.data.columns.slice(0, numberOfColumns);
                console.log(`✅ Trimmed to ${numberOfColumns} columns`);
            } else {
                console.log(`✅ Column count already correct: ${numberOfColumns}`);
            }
            
            console.log(`📊 Final column count: ${this.data.columns.length}`);
        }

        render() {
            // RENDER BASADO EN NÚMERO DE COLUMNAS - NO EN DATA.COLUMNS.LENGTH
            const numberOfColumns = this.data.settings.numberOfColumns || 2;
            console.log(`🎨 RENDER: Creating ${numberOfColumns} columns (ignoring existing data length: ${this.data.columns.length})`);
            
            // Asegurar que tenemos los datos correctos ANTES de renderizar
            this.ensureCorrectColumnCount();
            console.log(`📊 After ensuring count: ${this.data.columns.length} data columns for ${numberOfColumns} visual columns`);
            
            this.wrapper = document.createElement('div');
            this.wrapper.classList.add('cdx-columns-block');
            
            // Create columns container
            const columnsContainer = document.createElement('div');
            columnsContainer.classList.add('cdx-columns-container');
            this.updateColumnClasses(columnsContainer);
            
            // RENDERIZAR EXACTAMENTE numberOfColumns columnas (no más, no menos)
            for (let i = 0; i < numberOfColumns; i++) {
                // Siempre crear la columna, incluso si no hay datos
                const column = this.data.columns[i] || { content: '', blocks: [] };
                console.log(`🏗️ Creating visual column ${i + 1}/${numberOfColumns} (has data: ${!!this.data.columns[i]})`);
                const columnElement = this.createColumnElement(column, i);
                columnsContainer.appendChild(columnElement);
            }
            
            this.wrapper.appendChild(columnsContainer);
            
            console.log(`✅ Rendered ${numberOfColumns} columns visually`);
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
            columnContent.id = `column-editor-${Date.now()}-${index}`;
            
            columnDiv.appendChild(columnHeader);
            columnDiv.appendChild(columnContent);
            
            // Initialize Editor.js for this column if not in readOnly mode
            if (!this.readOnly && typeof EditorJS !== 'undefined') {
                setTimeout(() => {
                    this.initializeColumnEditor(columnContent.id, column, index);
                }, 100);
            } else if (this.readOnly) {
                // In read-only mode, render the blocks as static HTML
                this.renderReadOnlyColumn(columnContent, column);
            }
            
            return columnDiv;
        }

        initializeColumnEditor(holderId, column, index) {
            try {
                // Check if createEditor function is available from editorConfig.js
                if (typeof createEditor === 'undefined') {
                    console.error('createEditor function not available from editorConfig.js');
                    return;
                }
                
                const columnEditor = createEditor({
                    holder: holderId,
                    placeholder: `Add content to column ${index + 1}...`,
                    data: {
                        blocks: column.blocks || []
                    },
                    onChange: async () => {
                        try {
                            const savedData = await columnEditor.save();
                            if (savedData && savedData.blocks) {
                                this.data.columns[index].blocks = savedData.blocks;
                            }
                        } catch (error) {
                            console.error('Error saving column data:', error);
                        }
                    }
                });
                
                // Store the editor instance
                this.columnEditors[index] = columnEditor;
                
                console.log(`✅ Column ${index + 1} editor initialized with createEditor`);
            } catch (error) {
                console.error(`Error initializing column ${index + 1} editor:`, error);
            }
        }



        renderReadOnlyColumn(container, column) {
            if (!column.blocks || column.blocks.length === 0) {
                container.innerHTML = '<p class="cdx-empty-column">Empty column</p>';
                return;
            }
            
            // Render blocks as static HTML
            column.blocks.forEach(block => {
                const blockElement = this.renderBlockAsHTML(block);
                container.appendChild(blockElement);
            });
        }

        renderBlockAsHTML(block) {
            const element = document.createElement('div');
            element.classList.add('cdx-block');
            
            switch (block.type) {
                case 'header':
                    const level = block.data.level || 3;
                    element.innerHTML = `<h${level}>${block.data.text || ''}</h${level}>`;
                    break;
                    
                case 'paragraph':
                    element.innerHTML = `<p>${block.data.text || ''}</p>`;
                    break;
                    
                case 'list':
                    const listType = block.data.style === 'ordered' ? 'ol' : 'ul';
                    const items = block.data.items || [];
                    const itemsHTML = items.map(item => `<li>${item}</li>`).join('');
                    element.innerHTML = `<${listType}>${itemsHTML}</${listType}>`;
                    break;
                    
                case 'quote':
                    const text = block.data.text || '';
                    const caption = block.data.caption || '';
                    element.innerHTML = `
                        <blockquote>
                            <p>${text}</p>
                            ${caption ? `<cite>${caption}</cite>` : ''}
                        </blockquote>
                    `;
                    break;
                    
                case 'delimiter':
                    element.innerHTML = '<hr>';
                    break;
                    
                default:
                    element.innerHTML = `<p>Unsupported block type: ${block.type}</p>`;
            }
            
            return element;
        }

        renderSettings() {
            console.log('🛠️ renderSettings() called');
            const wrapper = document.createElement('div');
            wrapper.classList.add('cdx-columns-settings-panel');
            
            // Create breakpoint settings
            const breakpointSettings = this.createBreakpointSettings();
            console.log('✅ Created breakpoint settings');
            wrapper.appendChild(breakpointSettings);
            
            console.log('✅ renderSettings() completed');
            return wrapper;
        }

        createBreakpointSettings() {
            const container = document.createElement('div');
            container.classList.add('cdx-settings-container');
            
            const title = document.createElement('div');
            title.classList.add('cdx-settings-title');
            title.textContent = 'Column Layout Configuration';
            container.appendChild(title);
            
            // ✅ NEW: Number of columns selector
            const columnCountSetting = this.createColumnCountSetting();
            container.appendChild(columnCountSetting);
            
            // Create responsive settings for each breakpoint
            Object.keys(ColumnsConfig.breakpoints).forEach(breakpoint => {
                const setting = this.createBreakpointSetting(breakpoint);
                container.appendChild(setting);
            });
            
            // Create gutter settings
            const gutterSetting = this.createGutterSetting();
            container.appendChild(gutterSetting);
            
            return container;
        }

        createColumnCountSetting() {
            console.log('🔧 createColumnCountSetting() called');
            console.log('🔍 Current numberOfColumns:', this.data.settings.numberOfColumns);
            
            const wrapper = document.createElement('div');
            wrapper.classList.add('cdx-setting-row', 'cdx-column-count-setting');
            
            const label = document.createElement('label');
            label.classList.add('cdx-setting-label');
            label.innerHTML = '<strong>Number of Columns</strong><br><small>Choose how many columns you want</small>';
            
            const controls = document.createElement('div');
            controls.classList.add('cdx-setting-controls');
            
            const countSelect = document.createElement('select');
            countSelect.classList.add('cdx-setting-select', 'cdx-column-count-select');
            console.log('🎛️ Created select element');
            
            // Add options for number of columns
            console.log('📝 Adding column count options:', ColumnsConfig.columnCountOptions);
            ColumnsConfig.columnCountOptions.forEach((option, index) => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value;
                optionElement.textContent = option.label;
                optionElement.selected = option.value === (this.data.settings.numberOfColumns || 2);
                countSelect.appendChild(optionElement);
                console.log(`✅ Added option ${index + 1}: ${option.label} (value: ${option.value}, selected: ${optionElement.selected})`);
            });
            
            console.log('🎯 Final select innerHTML:', countSelect.innerHTML);
            
            // Event listener for column count change
            console.log('🔗 Adding change event listener to select');
            
            // Store reference to this for the event listener
            const self = this;
            
            countSelect.addEventListener('change', function(e) {
                const newColumnCount = parseInt(e.target.value);
                console.log('🔄 =============================================');
                console.log('🔄 COLUMN COUNT SELECTOR CHANGED!');
                console.log('🔄 New value:', newColumnCount);
                console.log('🔄 Event target:', e.target);
                console.log('🔄 Current self:', self);
                console.log('🔄 Current data numberOfColumns:', self.data.settings.numberOfColumns);
                console.log('🔄 Wrapper exists:', !!self.wrapper);
                console.log('🔄 =============================================');
                
                // Verify that we have valid context
                if (!self || !self.data || !self.data.settings) {
                    console.error('❌ Invalid context in event listener');
                    return;
                }
                
                try {
                    console.log('🚀 Calling changeColumnCount...');
                    self.changeColumnCount(newColumnCount);
                    console.log('✅ changeColumnCount completed');
                } catch (error) {
                    console.error('❌ Error in changeColumnCount:', error);
                }
            });
            
            console.log('✅ Event listener added to select');
            
            controls.appendChild(countSelect);
            wrapper.appendChild(label);
            wrapper.appendChild(controls);
            
            console.log('✅ createColumnCountSetting() completed successfully');
            console.log('🎛️ Select element attached to wrapper');
            return wrapper;
        }

        changeColumnCount(newCount) {
            const oldCount = this.data.settings.numberOfColumns || 2;
            
            console.log(`🏗️ changeColumnCount: ${oldCount} → ${newCount}`);
            
            if (newCount === oldCount) {
                console.log('⏹️ No change needed, same count');
                return;
            }
            
            // Update settings
            this.data.settings.numberOfColumns = newCount;
            console.log('✅ Updated numberOfColumns in settings');
            
            // Generate new default settings for the new column count
            const newSettings = ColumnsConfig.getDefaultSettings(newCount);
            
            // Preserve existing settings for breakpoints, extending or truncating as needed
            Object.keys(ColumnsConfig.breakpoints).forEach(breakpoint => {
                if (!this.data.settings[breakpoint]) {
                    this.data.settings[breakpoint] = {};
                }
                
                // Set defaults for new columns or remove old ones
                for (let i = 1; i <= newCount; i++) {
                    const colKey = `col${i}`;
                    if (!this.data.settings[breakpoint][colKey]) {
                        this.data.settings[breakpoint][colKey] = newSettings[breakpoint][colKey];
                    }
                }
                
                // Remove old column settings if reducing count
                for (let i = newCount + 1; i <= oldCount; i++) {
                    delete this.data.settings[breakpoint][`col${i}`];
                }
            });
            
            // Update gutters
            for (let i = 1; i <= newCount; i++) {
                const colKey = `col${i}`;
                if (!this.data.settings.gutters[colKey]) {
                    this.data.settings.gutters[colKey] = 'default';
                }
            }
            
            // Remove old gutter settings
            for (let i = newCount + 1; i <= oldCount; i++) {
                delete this.data.settings.gutters[`col${i}`];
            }
            
            // Update columns data BEFORE re-rendering
            console.log('🔧 About to ensure correct column count...');
            this.ensureCorrectColumnCount();
            console.log('✅ ensureCorrectColumnCount completed');
            console.log('📊 Final columns count in data:', this.data.columns.length);
            console.log('📊 Expected visual columns:', newCount);
            
            // Re-render the entire block to show the new columns
            console.log('🎬 About to start reRender...');
            this.reRender();
            console.log('🎬 reRender call completed');
        }

        reRender() {
            console.log('🔄 Starting reRender...');
            console.log('🔍 Wrapper exists:', !!this.wrapper);
            
            if (!this.wrapper) {
                console.warn('⚠️ Cannot reRender: wrapper missing');
                return;
            }
            
            try {
                // Clean up existing editors first
                if (this.columnEditors && this.columnEditors.length > 0) {
                    console.log('🧹 Cleaning up', this.columnEditors.length, 'existing editors');
                    this.columnEditors.forEach((editor, index) => {
                        if (editor && typeof editor.destroy === 'function') {
                            try {
                                editor.destroy();
                                console.log(`✅ Destroyed editor ${index + 1}`);
                            } catch (e) {
                                console.warn(`⚠️ Failed to destroy editor ${index + 1}:`, e);
                            }
                        }
                    });
                    this.columnEditors = [];
                }
                
                // Find the columns container inside the existing wrapper
                const existingContainer = this.wrapper.querySelector('.cdx-columns-container');
                if (!existingContainer) {
                    console.warn('⚠️ No columns container found, falling back to full render');
                    // Fallback to full re-render if container not found
                    const newWrapper = this.render();
                    this.wrapper.parentNode.replaceChild(newWrapper, this.wrapper);
                    return;
                }
                
                // Create new columns container content
                console.log('🏗️ Creating new columns container...');
                const newColumnsContainer = document.createElement('div');
                newColumnsContainer.classList.add('cdx-columns-container');
                this.updateColumnClasses(newColumnsContainer);
                
                // Create the columns based on current numberOfColumns setting
                const numberOfColumns = this.data.settings.numberOfColumns || 2;
                console.log(`🎨 Creating ${numberOfColumns} new columns`);
                
                for (let i = 0; i < numberOfColumns; i++) {
                    const column = this.data.columns[i] || { content: '', blocks: [] };
                    console.log(`🏗️ Creating new visual column ${i + 1}/${numberOfColumns}`);
                    const columnElement = this.createColumnElement(column, i);
                    newColumnsContainer.appendChild(columnElement);
                }
                
                // Replace just the columns container, not the entire wrapper
                console.log('🔄 Replacing columns container...');
                existingContainer.parentNode.replaceChild(newColumnsContainer, existingContainer);
                console.log('✅ Columns container replaced successfully');
                console.log(`✅ Now showing ${numberOfColumns} columns visually`);
                
            } catch (error) {
                console.error('❌ Error during reRender:', error);
            }
        }

        createBreakpointSetting(breakpoint) {
            const bp = ColumnsConfig.breakpoints[breakpoint];
            const currentSettings = this.data.settings[breakpoint];
            const numberOfColumns = this.data.settings.numberOfColumns || 2;
            
            const wrapper = document.createElement('div');
            wrapper.classList.add('cdx-setting-row');
            
            const label = document.createElement('label');
            label.classList.add('cdx-setting-label');
            label.innerHTML = `${bp.name}<br><small>${bp.description}</small>`;
            
            const controls = document.createElement('div');
            controls.classList.add('cdx-setting-controls');
            
            // Create selectors for each column dynamically
            for (let colIndex = 1; colIndex <= numberOfColumns; colIndex++) {
                const colKey = `col${colIndex}`;
                
                // Add separator between columns (except for the first one)
                if (colIndex > 1) {
                    const separator = document.createElement('span');
                    separator.textContent = ' : ';
                    separator.classList.add('cdx-column-separator');
                    controls.appendChild(separator);
                }
                
                // Create column selector
                const colSelect = document.createElement('select');
                colSelect.classList.add('cdx-setting-select');
                colSelect.dataset.column = colKey;
                colSelect.dataset.breakpoint = breakpoint;
                
                // Add options (1-12)
                for (let i = 1; i <= 12; i++) {
                    const option = document.createElement('option');
                    option.value = i;
                    option.textContent = i;
                    option.selected = i === currentSettings[colKey];
                    colSelect.appendChild(option);
                }
                
                // Event listener for column size change
                colSelect.addEventListener('change', (e) => {
                    const column = e.target.dataset.column;
                    const bp = e.target.dataset.breakpoint;
                    const newValue = parseInt(e.target.value);
                    
                    console.log(`🔧 Column width changed: ${bp}.${column} = ${newValue}`);
                    
                    // Update the setting
                    this.data.settings[bp][column] = newValue;
                    
                    // Update the grid layout
                    this.updateColumnClasses(this.wrapper.querySelector('.cdx-columns-container'));
                    
                    // Update the total indicator for this breakpoint
                    const settingRow = e.target.closest('.cdx-setting-row');
                    const totalIndicator = settingRow.querySelector('.cdx-total-indicator');
                    if (totalIndicator) {
                        this.updateTotalIndicator(totalIndicator, this.data.settings[bp], this.data.settings.numberOfColumns || 2);
                        console.log(`✅ Updated total indicator for ${bp}`);
                    }
                });
                
                controls.appendChild(colSelect);
            }
            
            // Add total width indicator
            const totalIndicator = document.createElement('span');
            totalIndicator.classList.add('cdx-total-indicator');
            this.updateTotalIndicator(totalIndicator, currentSettings, numberOfColumns);
            controls.appendChild(totalIndicator);
            
            wrapper.appendChild(label);
            wrapper.appendChild(controls);
            
            return wrapper;
        }

        updateTotalIndicator(indicator, settings, numberOfColumns) {
            let total = 0;
            for (let i = 1; i <= numberOfColumns; i++) {
                total += parseInt(settings[`col${i}`]) || 0;
            }
            
            // Show the total with helpful context
            indicator.innerHTML = ` <small>(Total: ${total}/12)</small>`;
            
            // Color coding based on total
            if (total > 12) {
                indicator.style.color = '#ff6b6b';
                indicator.innerHTML += ' <small style="color: #ff6b6b;">⚠️ Exceeds 12</small>';
            } else if (total < 12) {
                indicator.style.color = '#2196f3';
                indicator.innerHTML += ' <small style="color: #2196f3;">📏 Space available</small>';
            } else {
                indicator.style.color = '#4caf50';
                indicator.innerHTML += ' <small style="color: #4caf50;">✅ Full width</small>';
            }
        }

        createGutterSetting() {
            const wrapper = document.createElement('div');
            wrapper.classList.add('cdx-setting-row');
            
            const label = document.createElement('label');
            label.classList.add('cdx-setting-label');
            label.textContent = 'Column Spacing';
            
            const controls = document.createElement('div');
            controls.classList.add('cdx-setting-controls');
            
            const gutterSelect = document.createElement('select');
            gutterSelect.classList.add('cdx-setting-select');
            
            // Get the first column's gutter as default (they should all be the same)
            const currentGutter = this.data.settings.gutters.col1 || 'default';
            
            ColumnsConfig.gutterOptions.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value;
                optionElement.textContent = option.label;
                optionElement.selected = option.value === currentGutter;
                gutterSelect.appendChild(optionElement);
            });
            
            gutterSelect.addEventListener('change', (e) => {
                const value = e.target.value;
                const numberOfColumns = this.data.settings.numberOfColumns || 2;
                
                // Apply the same gutter to all columns
                for (let i = 1; i <= numberOfColumns; i++) {
                    this.data.settings.gutters[`col${i}`] = value;
                }
                
                this.updateColumnClasses(this.wrapper.querySelector('.cdx-columns-container'));
            });
            
            controls.appendChild(gutterSelect);
            wrapper.appendChild(label);
            wrapper.appendChild(controls);
            
            return wrapper;
        }





        updateColumnClasses(container) {
            if (!container) {
                console.warn('⚠️ updateColumnClasses: No container provided');
                return;
            }
            
            const { settings } = this.data;
            const numberOfColumns = settings.numberOfColumns || 2;
            
            console.log(`🎨 updateColumnClasses: ${numberOfColumns} columns`);
            
            // Reset to basic classes only
            container.className = 'cdx-columns-container';
            
            // Add number of columns class for basic styling
            container.classList.add(`cdx-columns-${numberOfColumns}`);
            
            // Apply CSS Grid directly instead of relying on specific classes
            this.updateGridTemplate(container);
            
            console.log(`✅ updateColumnClasses completed for ${numberOfColumns} columns`);
        }

        updateGridTemplate(container) {
            if (!container) return;
            
            const { settings } = this.data;
            const numberOfColumns = settings.numberOfColumns || 2;
            
            // Get current breakpoint (simplified detection)
            const width = window.innerWidth;
            let currentBreakpoint = 'xs';
            
            if (width >= 1470) currentBreakpoint = 'xl';
            else if (width >= 1200) currentBreakpoint = 'lg';
            else if (width >= 992) currentBreakpoint = 'md';
            else if (width >= 768) currentBreakpoint = 'sm';
            
            const currentSettings = settings[currentBreakpoint];
            
            // Build grid template - allow columns that don't sum to 12
            const columnFractions = [];
            for (let i = 1; i <= numberOfColumns; i++) {
                const colKey = `col${i}`;
                const colSize = currentSettings[colKey] || 1;
                columnFractions.push(`${colSize}fr`);
            }
            
            const gridTemplate = columnFractions.join(' ');
            
            console.log(`📐 Grid template (${currentBreakpoint}, ${width}px): ${gridTemplate}`);
            console.log(`📊 Column settings:`, currentSettings);
            
            // Apply the grid template
            container.style.gridTemplateColumns = gridTemplate;
            
            // Ensure it's a grid container
            container.style.display = 'grid';
            container.style.gap = '16px';
            
            console.log(`✅ Applied grid: ${gridTemplate}`);
        }



        async save() {
            // Save data from all column editors
            for (let i = 0; i < this.columnEditors.length; i++) {
                if (this.columnEditors[i]) {
                    try {
                        const savedData = await this.columnEditors[i].save();
                        if (savedData && savedData.blocks) {
                            this.data.columns[i].blocks = savedData.blocks;
                            // Remove the deprecated content field
                            delete this.data.columns[i].content;
                        }
                    } catch (error) {
                        console.error(`Error saving column ${i + 1}:`, error);
                    }
                }
            }
            
            return this.data;
        }

        destroy() {
            // Clean up all column editors
            this.columnEditors.forEach((editor, index) => {
                if (editor && typeof editor.destroy === 'function') {
                    try {
                        editor.destroy();
                        console.log(`✅ Column ${index + 1} editor destroyed`);
                    } catch (error) {
                        console.error(`Error destroying column ${index + 1} editor:`, error);
                    }
                }
            });
            this.columnEditors = [];
        }

        static get sanitize() {
            return {
                columns: {},
                settings: {}
            };
        }
    }

    // Make ColumnsBlock available globally
    window.ColumnsBlock = ColumnsBlock;
    
    // Debug logging
    console.log('✅ Columns Plugin loaded successfully');
    console.log('ColumnsBlock:', typeof ColumnsBlock);

})(window); 