/**
 * StoriesReel Block for Editor.js
 * Renders a reel/grid of stories with featured story and smaller stories below
 */
class StoriesReelBlock {
    static get toolbox() {
        return {
            title: 'Stories Reel',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="3" width="20" height="8" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><rect x="2" y="13" width="6" height="5" rx="1" stroke="currentColor" stroke-width="2" fill="none"/><rect x="9" y="13" width="6" height="5" rx="1" stroke="currentColor" stroke-width="2" fill="none"/><rect x="16" y="13" width="6" height="5" rx="1" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="5" cy="6" r="1" fill="currentColor"/><circle cx="5" cy="15" r="0.5" fill="currentColor"/><circle cx="12" cy="15" r="0.5" fill="currentColor"/><circle cx="19" cy="15" r="0.5" fill="currentColor"/></svg>'
        };
    }

    static get settings() {
        return [
            {
                name: 'storiesSettings',
                icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 6.5C8.067 6.5 6.5 8.067 6.5 10S8.067 13.5 10 13.5 13.5 11.933 13.5 10 11.933 6.5 10 6.5zM10 12C8.619 12 7.5 10.881 7.5 9.5S8.619 7 10 7s2.5 1.119 2.5 2.5S11.381 12 10 12z" fill="currentColor"/>
                    <path d="M17.5 10.5h-1.775c-0.131 0.522-0.331 1.019-0.594 1.481l1.256 1.256c0.394 0.394 0.394 1.031 0 1.425s-1.031 0.394-1.425 0l-1.256-1.256c-0.462 0.262-0.959 0.462-1.481 0.594V15.5c0 0.556-0.444 1-1 1s-1-0.444-1-1v-1.775c-0.522-0.131-1.019-0.331-1.481-0.594L6.487 14.387c-0.394 0.394-1.031 0.394-1.425 0s-0.394-1.031 0-1.425l1.256-1.256c-0.262-0.462-0.462-0.959-0.594-1.481H2.5c-0.556 0-1-0.444-1-1s0.444-1 1-1h1.775c0.131-0.522 0.331-1.019 0.594-1.481L3.613 5.487c-0.394-0.394-0.394-1.031 0-1.425s1.031-0.394 1.425 0l1.256 1.256c0.462-0.262 0.959-0.462 1.481-0.594V2.5c0-0.556 0.444-1 1-1s1 0.444 1 1v1.775c0.522 0.131 1.019 0.331 1.481 0.594l1.256-1.256c0.394-0.394 1.031-0.394 1.425 0s0.394 1.031 0 1.425l-1.256 1.256c0.262 0.462 0.462 0.959 0.594 1.481H17.5c0.556 0 1 0.444 1 1s-0.444 1-1 1z" fill="currentColor"/>
                </svg>`
            }
        ];
    }

    constructor({ data, api, readOnly }) {
        this.api = api;
        this.readOnly = readOnly;
        
        // Default configuration
        this.data = {
            layout: data.layout || 'featured-grid', // featured-grid, grid-only, list
            count: data.count || 4, // Total stories to show
            category: data.category || '', // Filter by category
            showExcerpts: data.showExcerpts !== undefined ? data.showExcerpts : false,
            showDates: data.showDates !== undefined ? data.showDates : true,
            showAuthor: data.showAuthor !== undefined ? data.showAuthor : false,
            title: data.title || 'Latest Stories',
            showTitle: data.showTitle !== undefined ? data.showTitle : true
        };
        
        this.wrapper = null;
        this.settingsOpened = false;
        this.stories = [];
    }

    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('stories-reel-block');
        
        // Load and display stories
        this.loadStories().then(() => {
            this.renderStories();
        });
        
        // Show loading state initially
        this.wrapper.innerHTML = this.generateLoadingHTML();
        
        return this.wrapper;
    }

    async loadStories() {
        try {
            // Build API URL with parameters
            let apiUrl = `/api/public/stories?limit=${this.data.count}`;
            if (this.data.category) {
                apiUrl += `&category=${this.data.category}`;
            }
            
            const response = await fetch(apiUrl);
            const result = await response.json();
            
            if (result.success) {
                this.stories = result.data || [];
            } else {
                console.warn('API returned error:', result.message);
                this.stories = [];
            }
        } catch (error) {
            console.error('Error loading stories:', error);
            this.stories = [];
        }
    }



    renderStories() {
        if (!this.stories || this.stories.length === 0) {
            this.wrapper.innerHTML = `
                <div class="stories-reel-empty">
                    <p>No stories available.</p>
                    <small>Create some stories in the admin panel to see them here.</small>
                </div>
            `;
            return;
        }

        let html = '';
        
        if (this.data.showTitle && this.data.title) {
            html += `<h3 class="stories-reel-title">${this.data.title}</h3>`;
        }

        html += '<div class="stories-reel-container">';

        if (this.data.layout === 'featured-grid') {
            html += this.renderFeaturedGridLayout();
        } else if (this.data.layout === 'grid-only') {
            html += this.renderGridOnlyLayout();
        } else if (this.data.layout === 'list') {
            html += this.renderListLayout();
        }

        html += '</div>';
        
        this.wrapper.innerHTML = html;
    }

    renderFeaturedGridLayout() {
        const [featured, ...others] = this.stories;
        const featuredImageUrl = this.getStoryImage(featured);
        
        let html = `
            <div class="stories-reel-featured">
                <a href="/story/${featured.slug}" class="story-featured-link">
                    <div class="story-featured" style="background-image: url('${featuredImageUrl}')">
                        <div class="story-featured-overlay">
                            <h2 class="story-featured-title">${featured.title}</h2>
                            ${this.data.showDates ? `<span class="story-featured-date">${this.formatTimeAgo(featured.published_at)}</span>` : ''}
                        </div>
                    </div>
                </a>
            </div>
        `;

        if (others.length > 0) {
            html += '<div class="stories-reel-grid">';
            others.forEach(story => {
                html += this.renderStoryCard(story);
            });
            html += '</div>';
        }

        return html;
    }

    renderGridOnlyLayout() {
        let html = '<div class="stories-reel-grid stories-reel-grid-only">';
        this.stories.forEach(story => {
            html += this.renderStoryCard(story);
        });
        html += '</div>';
        return html;
    }

    renderListLayout() {
        let html = '<div class="stories-reel-list">';
        this.stories.forEach(story => {
            const imageUrl = this.getStoryImage(story);
            
            html += `
                <div class="story-list-item">
                    <a href="/story/${story.slug}" class="story-list-link">
                        <div class="story-list-image">
                            <img src="${imageUrl}" alt="${story.title}" />
                        </div>
                        <div class="story-list-content">
                            <h4 class="story-list-title">${story.title}</h4>
                            ${this.data.showExcerpts ? `<p class="story-list-excerpt">${story.excerpt}</p>` : ''}
                            <div class="story-list-meta">
                                ${this.data.showDates ? `<span class="story-list-date">${this.formatTimeAgo(story.published_at)}</span>` : ''}
                                ${this.data.showAuthor && story.author ? `<span class="story-list-author">by ${story.author.first_name} ${story.author.last_name}</span>` : ''}
                            </div>
                        </div>
                    </a>
                </div>
            `;
        });
        html += '</div>';
        return html;
    }

    /**
     * Get the best available image for a story
     * Priority: summary_image > featured_image > placeholder
     */
    getStoryImage(story) {
        // First priority: summary_image (new field for better thumbnails)
        if (story.summary_image && story.summary_image.trim()) {
            return story.summary_image;
        }
        
        // Second priority: featured_image (fallback)
        if (story.featured_image && story.featured_image.trim()) {
            return story.featured_image;
        }
        
        // Final fallback: simple placeholder
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    }

    renderStoryCard(story) {
        const imageUrl = this.getStoryImage(story);
        
        return `
            <div class="story-card">
                <a href="/story/${story.slug}" class="story-card-link">
                    <div class="story-card-image">
                        <img src="${imageUrl}" alt="${story.title}" />
                        ${story.category ? `<span class="story-card-category">${story.category.name}</span>` : ''}
                    </div>
                    <div class="story-card-content">
                        <h4 class="story-card-title">${story.title}</h4>
                        ${this.data.showExcerpts ? `<p class="story-card-excerpt">${story.excerpt}</p>` : ''}
                        <div class="story-card-meta">
                            ${this.data.showDates ? `<span class="story-card-date">${this.formatTimeAgo(story.published_at)}</span>` : ''}
                            ${this.data.showAuthor && story.author ? `<span class="story-card-author">by ${story.author.first_name} ${story.author.last_name}</span>` : ''}
                        </div>
                    </div>
                </a>
            </div>
        `;
    }

    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now - date;
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInDays > 0) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        } else if (diffInHours > 0) {
            const remainingMinutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
            return `${diffInHours} hr${diffInHours > 1 ? 's' : ''} ${remainingMinutes} min${remainingMinutes > 1 ? 's' : ''} ago`;
        } else {
            const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
            return `${Math.max(1, diffInMinutes)} min${diffInMinutes > 1 ? 's' : ''} ago`;
        }
    }

    generateLoadingHTML() {
        return `
            <div class="stories-reel-loading">
                <div class="loading-spinner"></div>
                <span>Loading stories...</span>
            </div>
        `;
    }

    renderSettings() {
        const settingsContent = document.createElement('div');
        settingsContent.classList.add('stories-reel-popover-settings');
        settingsContent.innerHTML = this.createSettingsHTML();
        
        this.attachSettingsEvents(settingsContent);
        
        return settingsContent;
    }

    createSettingsHTML() {
        return `
            <div class="stories-reel-settings">
                <div class="setting-group">
                    <label>Layout:</label>
                    <select id="layout-select">
                        <option value="featured-grid" ${this.data.layout === 'featured-grid' ? 'selected' : ''}>Featured + Grid</option>
                        <option value="grid-only" ${this.data.layout === 'grid-only' ? 'selected' : ''}>Grid Only</option>
                        <option value="list" ${this.data.layout === 'list' ? 'selected' : ''}>List</option>
                    </select>
                </div>
                <div class="setting-group">
                    <label>Stories Count:</label>
                    <input type="number" id="count-input" min="1" max="12" value="${this.data.count}" />
                </div>
                <div class="setting-group">
                    <label>Title:</label>
                    <input type="text" id="title-input" value="${this.data.title}" placeholder="Enter reel title" />
                </div>
                <div class="setting-group">
                    <label>
                        <input type="checkbox" id="show-title" ${this.data.showTitle ? 'checked' : ''} />
                        Show Title
                    </label>
                </div>
                <div class="setting-group">
                    <label>
                        <input type="checkbox" id="show-dates" ${this.data.showDates ? 'checked' : ''} />
                        Show Dates
                    </label>
                </div>
                <div class="setting-group">
                    <label>
                        <input type="checkbox" id="show-excerpts" ${this.data.showExcerpts ? 'checked' : ''} />
                        Show Excerpts
                    </label>
                </div>
                <div class="setting-group">
                    <label>
                        <input type="checkbox" id="show-author" ${this.data.showAuthor ? 'checked' : ''} />
                        Show Author
                    </label>
                </div>
                <div class="setting-buttons">
                    <button type="button" id="apply-settings">Apply</button>
                    <button type="button" id="cancel-settings">Cancel</button>
                </div>
            </div>
        `;
    }

    attachSettingsEvents(settingsElement) {
        const applyBtn = settingsElement.querySelector('#apply-settings');
        const cancelBtn = settingsElement.querySelector('#cancel-settings');

        applyBtn.addEventListener('click', () => {
            this.data.layout = settingsElement.querySelector('#layout-select').value;
            this.data.count = parseInt(settingsElement.querySelector('#count-input').value);
            this.data.title = settingsElement.querySelector('#title-input').value;
            this.data.showTitle = settingsElement.querySelector('#show-title').checked;
            this.data.showDates = settingsElement.querySelector('#show-dates').checked;
            this.data.showExcerpts = settingsElement.querySelector('#show-excerpts').checked;
            this.data.showAuthor = settingsElement.querySelector('#show-author').checked;

            // Reload stories with new settings
            this.loadStories().then(() => {
                this.renderStories();
            });

            this.settingsOpened = false;
        });

        cancelBtn.addEventListener('click', () => {
            this.settingsOpened = false;
        });
    }

    save() {
        return this.data;
    }

    static get shortcut() {
        return 'CMD+SHIFT+S';
    }

    static get isReadOnlySupported() {
        return true;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StoriesReelBlock;
} else if (typeof window !== 'undefined') {
    window.StoriesReelBlock = StoriesReelBlock;
} 