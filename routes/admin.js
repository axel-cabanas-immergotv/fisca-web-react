const express = require('express');
const { verifyToken } = require('../middleware/auth');

// Import entity routers
const storiesRouter = require('./admin/stories');
const pagesRouter = require('./admin/pages');
const modulesRouter = require('./admin/modules');
const categoriesRouter = require('./admin/categories');
const menusRouter = require('./admin/menus');
const usersRouter = require('./admin/users');
const rolesRouter = require('./admin/roles');
const permissionsRouter = require('./admin/permissions');
const affiliatesRouter = require('./admin/affiliates');

const router = express.Router();

// Apply authentication to all admin routes
router.use(verifyToken);

// Link data endpoint for Editor.js LinkTool
router.get('/link-data', async (req, res) => {
    try {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({
                success: false,
                message: 'URL parameter is required'
            });
        }

        // Basic URL validation
        try {
            new URL(url);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid URL format'
            });
        }

        // Simple response - In production, you might want to fetch actual metadata
        res.json({
            success: true,
            link: url,
            meta: {
                title: 'Link',
                description: 'External link',
                image: {
                    url: ''
                }
            }
        });

    } catch (error) {
        console.error('Error fetching link data:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching link data'
        });
    }
});

// Mount entity routers
router.use('/stories', storiesRouter);
router.use('/pages', pagesRouter);
router.use('/modules', modulesRouter);
router.use('/categories', categoriesRouter);
router.use('/menus', menusRouter);
router.use('/users', usersRouter);
router.use('/roles', rolesRouter);
router.use('/permissions', permissionsRouter);
router.use('/affiliates', affiliatesRouter);

module.exports = router; 