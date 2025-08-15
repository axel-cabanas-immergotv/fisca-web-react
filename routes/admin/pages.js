const express = require('express');
const { Op } = require('sequelize');
const { User, Page } = require('../../models');
const { hasPermission, canEditOwn } = require('../../middleware/auth');
const { affiliateMiddleware, requireAffiliate, addAffiliateFilter, addAffiliateToData } = require('../../middleware/affiliate');
const { UserAffiliate, Affiliate } = require('../../models'); // Added UserAffiliate and Affiliate models

const router = express.Router();

// GET /api/admin/pages - List all pages with pagination
router.get('/', affiliateMiddleware, hasPermission('pages.read'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, global } = req.query;
    const offset = (page - 1) * limit;

    let where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } }
      ];
    }

    // If global=true or no affiliate context, show all pages the current user has access to
    if (global === 'true' || !req.currentAffiliate) {
      // Get all affiliates the current user has access to
      const userAffiliates = await UserAffiliate.findAll({
        where: { user_id: req.user.id },
        include: [{
          model: Affiliate,
          as: 'affiliate'
        }]
      });

      const affiliateIds = userAffiliates.map(ua => ua.affiliate.id);

      const pages = await Page.findAndCountAll({
        where: affiliateIds.length > 0 ? { ...where, affiliate_id: { [Op.in]: affiliateIds } } : where,
        include: [
          { model: User, as: 'author', attributes: ['first_name', 'last_name'] },
          { model: Page, as: 'parent', attributes: ['title', 'slug'] }
        ],
        order: [['sort_order', 'ASC'], ['title', 'ASC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: pages.rows,
        pagination: {
          total: pages.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(pages.count / limit)
        }
      });
    } else {
      // Add affiliate filter for specific affiliate
      where = addAffiliateFilter(where, req.affiliateId);

      const pages = await Page.findAndCountAll({
        where,
        include: [
          { model: User, as: 'author', attributes: ['first_name', 'last_name'] },
          { model: Page, as: 'parent', attributes: ['title', 'slug'] }
        ],
        order: [['sort_order', 'ASC'], ['title', 'ASC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: pages.rows,
        pagination: {
          total: pages.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(pages.count / limit)
        }
      });
    }
  } catch (error) {
    console.error('Get pages error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/admin/pages/:id - Get single page
router.get('/:id', affiliateMiddleware, requireAffiliate, hasPermission('pages.read'), async (req, res) => {
  try {
    const page = await Page.findOne({
      where: {
        id: req.params.id,
        affiliate_id: req.affiliateId
      },
      include: [
        { model: User, as: 'author' },
        { model: Page, as: 'parent' },
        { model: Page, as: 'children' }
      ]
    });

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    res.json({ success: true, data: page });
  } catch (error) {
    console.error('Get page error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/admin/pages - Create new page
router.post('/', affiliateMiddleware, requireAffiliate, hasPermission('pages.create'), async (req, res) => {
  try {
    const pageData = addAffiliateToData({
      ...req.body,
      author_id: req.user.id
    }, req.affiliateId);

    const page = await Page.create(pageData);
    res.status(201).json({ success: true, data: page });
  } catch (error) {
    console.error('Create page error:', error);
    
    // Return more specific error information
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT /api/admin/pages/:id - Update page
router.put('/:id', affiliateMiddleware, requireAffiliate, hasPermission('pages.update'), canEditOwn('Page'), async (req, res) => {
  try {
    const page = await Page.findOne({
      where: {
        id: req.params.id,
        affiliate_id: req.affiliateId
      }
    });
    
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    // Prevent deletion of system pages
    if (page.is_system && req.body.hasOwnProperty('slug')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot modify slug of system pages' 
      });
    }

    await page.update(req.body);
    res.json({ success: true, data: page });
  } catch (error) {
    console.error('Update page error:', error);
    
    // Return more specific error information
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE /api/admin/pages/:id - Delete page
router.delete('/:id', affiliateMiddleware, requireAffiliate, hasPermission('pages.delete'), async (req, res) => {
  try {
    const page = await Page.findOne({
      where: {
        id: req.params.id,
        affiliate_id: req.affiliateId
      }
    });
    
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    if (page.is_system) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete system pages' 
      });
    }

    await page.destroy();
    res.json({ success: true, message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Delete page error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router; 