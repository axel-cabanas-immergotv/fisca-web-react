const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

/**
 * COLUMNS PLUGIN INTEGRATION NOTES:
 * 
 * The Columns Plugin for Editor.js is located at src/editorjs/columns/
 * 
 * To include the plugin in your build:
 * 1. The JavaScript files are automatically bundled when imported in admin.js
 * 2. The CSS can be included in the admin.css build or served separately
 * 
 * Integration options:
 * 
 * Option 1 - Include CSS in admin.css:
 * Add @import './editorjs/columns/columns.css'; to src/styles/admin.css
 * 
 * Option 2 - Build CSS separately:
 * Uncomment the "Build Columns Plugin CSS" section below
 * 
 * Option 3 - Import directly in admin.js:
 * Add the import in admin.js: import './editorjs/columns/integration.js';
 * 
 * The plugin files are structured for easy maintenance:
 * - index.js: Main plugin class
 * - columns.css: Plugin styles
 * - config.js: Configuration and utilities
 * - integration.js: Integration helpers
 * - README.md: Complete documentation
 */

async function build() {
  try {
    console.log('Building frontend assets...');

    // Build admin panel
    await esbuild.build({
      entryPoints: ['src/admin/admin.js'],
      bundle: true,
      minify: process.env.NODE_ENV === 'production',
      outfile: 'dist/admin.js',
      target: 'es2017',
      platform: 'browser',
      sourcemap: process.env.NODE_ENV !== 'production',
      external: ['https://cdn.jsdelivr.net/*']
    });

    // Build login page
    await esbuild.build({
      entryPoints: ['src/auth/login.js'],
      bundle: true,
      minify: process.env.NODE_ENV === 'production',
      outfile: 'dist/login.js',
      target: 'es2017',
      platform: 'browser',
      sourcemap: process.env.NODE_ENV !== 'production'
    });

    // Build public site
    await esbuild.build({
      entryPoints: ['src/public/main.js'],
      bundle: true,
      minify: process.env.NODE_ENV === 'production',
      outfile: 'dist/main.js',
      target: 'es2017',
      platform: 'browser',
      sourcemap: process.env.NODE_ENV !== 'production'
    });

    // Build story page
    await esbuild.build({
      entryPoints: ['src/public/story.js'],
      bundle: true,
      minify: process.env.NODE_ENV === 'production',
      outfile: 'dist/story.js',
      target: 'es2017',
      platform: 'browser',
      sourcemap: process.env.NODE_ENV !== 'production'
    });

    // Build CSS
    await esbuild.build({
      entryPoints: ['src/styles/main.css'],
      bundle: true,
      minify: process.env.NODE_ENV === 'production',
      outfile: 'dist/main.css',
      loader: {
        '.css': 'css',
        '.woff': 'file',
        '.woff2': 'file',
        '.ttf': 'file',
        '.eot': 'file',
        '.svg': 'file'
      }
    });

    await esbuild.build({
      entryPoints: ['src/styles/admin.css'],
      bundle: true,
      minify: process.env.NODE_ENV === 'production',
      outfile: 'dist/admin.css',
      loader: {
        '.css': 'css',
        '.woff': 'file',
        '.woff2': 'file',
        '.ttf': 'file',
        '.eot': 'file',
        '.svg': 'file'
      }
    });

    // Build Columns Plugin CSS
    await esbuild.build({
      entryPoints: ['src/editorjs/columns/columns.css'],
      bundle: true,
      minify: process.env.NODE_ENV === 'production',
      outfile: 'dist/columns.css',
      loader: {
        '.css': 'css'
      }
    });

    // Build Columns Plugin JS (global version)
    await esbuild.build({
      entryPoints: ['src/editorjs/columns/columns-global.js'],
      bundle: true,
      minify: process.env.NODE_ENV === 'production',
      outfile: 'dist/columns-global.js',
      target: 'es2017',
      platform: 'browser',
      sourcemap: process.env.NODE_ENV !== 'production'
    });

    // Build AdvUnit Plugin CSS
    await esbuild.build({
      entryPoints: ['src/editorjs/advunit/advunit.css'],
      bundle: true,
      minify: process.env.NODE_ENV === 'production',
      outfile: 'dist/advunit.css',
      loader: {
        '.css': 'css'
      }
    });

    // Build AdvUnit Plugin JS (global version)
    await esbuild.build({
      entryPoints: ['src/editorjs/advunit/advunit-global.js'],
      bundle: true,
      minify: process.env.NODE_ENV === 'production',
      outfile: 'dist/advunit-global.js',
      target: 'es2017',
      platform: 'browser',
      sourcemap: process.env.NODE_ENV !== 'production'
    });

    // Build StoriesReel Plugin CSS
    await esbuild.build({
      entryPoints: ['src/editorjs/storiesreel/storiesreel.css'],
      bundle: true,
      minify: process.env.NODE_ENV === 'production',
      outfile: 'dist/storiesreel.css',
      loader: {
        '.css': 'css'
      }
    });

    // Build StoriesReel Plugin JS (global version)
    await esbuild.build({
      entryPoints: ['src/editorjs/storiesreel/storiesreel-global.js'],
      bundle: true,
      minify: process.env.NODE_ENV === 'production',
      outfile: 'dist/storiesreel-global.js',
      target: 'es2017',
      platform: 'browser',
      sourcemap: process.env.NODE_ENV !== 'production'
    });

    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

// Process HTML templates with includes
function processHTMLTemplates() {
  console.log('Processing HTML templates...');
  
  // Function to process entity folders and combine their HTML files
  function processEntityFolder(entityPath) {
    if (!fs.existsSync(entityPath)) {
      return '';
    }
    
    const files = fs.readdirSync(entityPath).filter(file => file.endsWith('.html'));
    
    // Sort files: index.html first, editor.html second, others alphabetically
    files.sort((a, b) => {
      if (a === 'index.html') return -1;
      if (b === 'index.html') return 1;
      if (a === 'editor.html') return -1;
      if (b === 'editor.html') return 1;
      return a.localeCompare(b);
    });
    
    let combinedContent = '';
    files.forEach(file => {
      const filePath = path.join(entityPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      combinedContent += content + '\n';
    });
    
    return combinedContent;
  }
  
  // Function to process template includes
  function processTemplate(templatePath, basePath = '') {
    const fullPath = path.join(basePath, templatePath);
    
    if (!fs.existsSync(fullPath)) {
      console.error(`Template not found: ${fullPath}`);
      return '';
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Process {{include "path"}} directives
    const includeRegex = /\{\{include\s+"([^"]+)"\}\}/g;
    content = content.replace(includeRegex, (match, includePath) => {
      const includeFullPath = path.join(path.dirname(fullPath), includePath);
      return processTemplate(includePath, path.dirname(fullPath));
    });
    
    // Process {{include-entity "EntityName"}} directives for new folder structure
    const entityIncludeRegex = /\{\{include-entity\s+"([^"]+)"\}\}/g;
    content = content.replace(entityIncludeRegex, (match, entityName) => {
      const entityPath = path.join('src/admin', entityName);
      return processEntityFolder(entityPath);
    });
    
    return content;
  }
  
  // Process admin template
  try {
    const adminTemplate = 'src/admin/admin-template.html';
    if (fs.existsSync(adminTemplate)) {
      let processedContent = processTemplate('admin-template.html', 'src/admin');
      
      // If the template doesn't use new directives, build manually
      if (!processedContent.includes('{{include-entity')) {
        // Build content manually by combining all entity folders
        const adminDir = 'src/admin';
                 const entities = ['Head', 'Navbar', 'Sidebar', 'Dashboard', 'Categories', 'Modules', 'Menus', 'Pages', 'Roles', 'Stories', 'Users', 'Permissions', 'Affiliates', 'Footer'];
        
        // Read base template files
        let baseContent = '';
        const baseFiles = ['templates/head.html', 'templates/navbar.html', 'templates/sidebar.html'];
        baseFiles.forEach(file => {
          const filePath = path.join(adminDir, file);
          if (fs.existsSync(filePath)) {
            baseContent += fs.readFileSync(filePath, 'utf8') + '\n';
          }
        });
        
        // Add all entity content
        let entitiesContent = '';
        entities.forEach(entity => {
          const entityPath = path.join(adminDir, entity);
          entitiesContent += processEntityFolder(entityPath);
        });
        
        // Add footer
        const footerPath = path.join(adminDir, 'templates/footer.html');
        let footerContent = '';
        if (fs.existsSync(footerPath)) {
          footerContent = fs.readFileSync(footerPath, 'utf8');
        }
        
        processedContent = baseContent + entitiesContent + footerContent;
      }
      
      fs.writeFileSync('dist/admin.html', processedContent);
      console.log('✅ Generated dist/admin.html from templates');
    } else {
      // Fallback to copying original admin.html if template doesn't exist
      if (fs.existsSync('src/admin/admin.html')) {
        fs.copyFileSync('src/admin/admin.html', 'dist/admin.html');
        console.log('📋 Copied src/admin/admin.html to dist/admin.html (fallback)');
      }
    }
  } catch (error) {
    console.error('❌ Error processing admin template:', error);
    // Fallback to copying original
    if (fs.existsSync('src/admin/admin.html')) {
      fs.copyFileSync('src/admin/admin.html', 'dist/admin.html');
      console.log('📋 Fallback: Copied src/admin/admin.html to dist/admin.html');
    }
  }
}

// Copy HTML templates
function copyHTMLFiles() {
  const htmlFiles = [
    { src: 'src/public/index.html', dest: 'dist/index.html' },
    { src: 'src/public/story.html', dest: 'dist/story.html' },
    { src: 'src/auth/login.html', dest: 'dist/login.html' }
  ];

  htmlFiles.forEach(({ src, dest }) => {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`Copied ${src} to ${dest}`);
    }
  });

  // Copy logo file
  if (fs.existsSync('logo.svg')) {
    fs.copyFileSync('logo.svg', 'dist/logo.svg');
    console.log('Copied logo.svg to dist/logo.svg');
  }
}

// Copy static assets
function copyStaticAssets() {
  const assetsDir = 'src/assets';
  const distAssetsDir = 'dist/assets';

  if (fs.existsSync(assetsDir)) {
    if (!fs.existsSync(distAssetsDir)) {
      fs.mkdirSync(distAssetsDir, { recursive: true });
    }

    const copyRecursive = (src, dest) => {
      const stats = fs.statSync(src);
      if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest);
        }
        fs.readdirSync(src).forEach(item => {
          copyRecursive(path.join(src, item), path.join(dest, item));
        });
      } else {
        fs.copyFileSync(src, dest);
      }
    };

    copyRecursive(assetsDir, distAssetsDir);
    console.log('Static assets copied successfully!');
  }
}

async function main() {
  await build();
  processHTMLTemplates(); // Process templates first
  copyHTMLFiles();
  copyStaticAssets();
}

if (require.main === module) {
  main();
}

module.exports = { build, processHTMLTemplates, copyHTMLFiles, copyStaticAssets }; 