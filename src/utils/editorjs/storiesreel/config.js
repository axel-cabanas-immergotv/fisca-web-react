/**
 * Stories Reel Block Configuration
 * This file contains configuration settings and default values for the Stories Reel widget
 */

const StoriesReelConfig = {
    // Default widget settings
    defaults: {
        layout: 'featured-grid', // featured-grid, grid-only, list
        count: 4, // Number of stories to display
        category: '', // Filter by category ID or slug
        useRandomImages: true, // Use random placeholder images
        showExcerpts: false, // Show story excerpts
        showDates: true, // Show publication dates
        showAuthor: false, // Show story authors
        title: 'Latest Stories', // Widget title
        showTitle: true // Display the widget title
    },

    // Layout options
    layoutOptions: [
        {
            value: 'featured-grid',
            label: 'Featured + Grid',
            description: 'One large featured story with smaller stories in a grid below'
        },
        {
            value: 'grid-only',
            label: 'Grid Only',
            description: 'All stories displayed in an equal grid layout'
        },
        {
            value: 'list',
            label: 'List View',
            description: 'Stories displayed in a vertical list with horizontal cards'
        }
    ],

    // Random image services configuration
    imageServices: {
        picsum: {
            baseUrl: 'https://picsum.photos',
            sizes: {
                featured: '800/600',
                card: '400/300',
                list: '300/200'
            }
        },
        unsplash: {
            baseUrl: 'https://source.unsplash.com',
            sizes: {
                featured: '800x600',
                card: '400x300',
                list: '300x200'
            },
            categories: ['nature', 'city', 'people', 'technology', 'business']
        }
    },

    // API endpoints
    endpoints: {
        stories: '/api/public/stories',
        categories: '/api/public/categories'
    },

    // Widget constraints
    constraints: {
        minCount: 1,
        maxCount: 12,
        maxTitleLength: 100
    },

    // CSS class names
    cssClasses: {
        block: 'stories-reel-block',
        container: 'stories-reel-container',
        featured: 'stories-reel-featured',
        grid: 'stories-reel-grid',
        list: 'stories-reel-list',
        loading: 'stories-reel-loading',
        settings: 'stories-reel-popover-settings'
    },

    // Keyboard shortcuts
    shortcuts: {
        widget: 'CMD+SHIFT+S',
        settings: 'CMD+,'
    },

    // Animation durations (in milliseconds)
    animations: {
        hover: 300,
        loading: 1000,
        fadeIn: 500
    },

    // Responsive breakpoints
    breakpoints: {
        mobile: 480,
        tablet: 768,
        desktop: 1024,
        large: 1200
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StoriesReelConfig;
} else if (typeof window !== 'undefined') {
    window.StoriesReelConfig = StoriesReelConfig;
} 