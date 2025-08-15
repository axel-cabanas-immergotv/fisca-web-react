# Stories Reel Block for Editor.js

A custom Editor.js widget that displays a responsive reel/grid of stories with multiple layout options. Perfect for showcasing featured stories, latest news, or creating dynamic content sections.

## Features

- 🎬 **Multiple Layouts**: Featured + Grid, Grid Only, List View
- 📱 **Fully Responsive**: Adapts to all screen sizes
- 🎨 **Modern Design**: Clean, professional appearance
- ⚙️ **Configurable**: Extensive customization options
- 🖼️ **Random Images**: Uses Lorem Picsum for placeholder images
- 🔄 **Real-time Updates**: Fetches live stories from your database
- 🎯 **Category Filtering**: Filter stories by category
- 📅 **Date Formatting**: Smart relative date display
- 👤 **Author Display**: Show/hide story authors
- 🏷️ **Category Tags**: Visual category indicators

## Usage

### Adding to Editor.js

The widget is automatically loaded when you include the admin interface. It appears in the Editor.js toolbar as "Stories Reel".

### Quick Start

1. Click the "Stories Reel" button in the Editor.js toolbar
2. Configure your settings using the settings gear icon
3. The widget will automatically load and display stories

### Layout Options

#### Featured + Grid
- One large featured story at the top
- Smaller stories in a grid below
- Perfect for highlighting important content

#### Grid Only
- All stories in equal-sized grid layout
- Consistent visual weight for all stories
- Great for category pages or story collections

#### List View
- Horizontal cards with image and content side by side
- Compact layout showing more information
- Ideal for sidebar or compact sections

## Configuration Options

### Basic Settings

- **Layout**: Choose between Featured+Grid, Grid Only, or List View
- **Stories Count**: Number of stories to display (1-12)
- **Title**: Custom title for the reel section
- **Show Title**: Toggle title visibility

### Display Options

- **Show Dates**: Display relative publication dates
- **Show Excerpts**: Include story excerpts/descriptions
- **Show Author**: Display story author names
- **Use Random Images**: Use placeholder images for stories without featured images

### Advanced Settings

- **Category Filter**: Filter stories by specific category
- **Custom Styling**: Additional CSS classes can be applied

## API Integration

The widget automatically fetches stories from:
- **Endpoint**: `/api/public/stories`
- **Parameters**: 
  - `limit`: Number of stories to fetch
  - `category`: Filter by category slug or ID
  - `status`: Story status (default: 'published')

## Styling

### CSS Classes

The widget uses these main CSS classes for styling:

```css
.stories-reel-block          /* Main container */
.stories-reel-featured       /* Featured story layout */
.stories-reel-grid          /* Grid layout */
.stories-reel-list          /* List layout */
.story-card                 /* Individual story cards */
.story-featured             /* Featured story */
```

### Customization

You can override the default styles by adding custom CSS:

```css
.stories-reel-block {
    /* Your custom styles */
}
```

## Responsive Breakpoints

- **Mobile**: < 480px - Single column layout
- **Tablet**: 480px - 768px - Optimized for touch
- **Desktop**: > 768px - Full multi-column layout

## Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## Development

### File Structure

```
src/editorjs/storiesreel/
├── index.js              # Main widget class
├── config.js             # Configuration settings
├── integration.js        # Editor.js integration
├── storiesreel.css      # Widget styles
├── storiesreel-global.js # Auto-loader
└── README.md            # This documentation
```

### Loading Order

1. `config.js` - Configuration and defaults
2. `index.js` - Main widget implementation
3. `integration.js` - Editor.js integration
4. `storiesreel.css` - Styles

### Events

The widget fires custom events:

```javascript
// Listen for widget load completion
document.addEventListener('storiesReelLoaded', (event) => {
    console.log('Stories Reel widget loaded:', event.detail);
});
```

## Troubleshooting

### Widget Not Appearing

1. Check browser console for JavaScript errors
2. Verify all dependencies are loaded
3. Ensure Editor.js is properly initialized

### Stories Not Loading

1. Check network tab for API errors
2. Verify `/api/public/stories` endpoint is accessible
3. Check database for published stories

### Styling Issues

1. Verify CSS file is loaded
2. Check for CSS conflicts with existing styles
3. Use browser dev tools to inspect elements

## Performance

- **Lazy Loading**: Images load only when visible
- **API Caching**: Stories are cached for better performance
- **Responsive Images**: Optimized image sizes for different layouts
- **Minimal Dependencies**: Lightweight implementation

## Contributing

1. Follow existing code style and patterns
2. Test across different browsers and devices
3. Update documentation for new features
4. Ensure backward compatibility

## License

This widget is part of the Web Editor CMS project and follows the same licensing terms. 