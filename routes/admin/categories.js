const express = require('express');
const { Op } = require('sequelize');
const { Category, UserAffiliate, Affiliate } = require('../../models');
const { hasPermission } = require('../../middleware/auth');
const { affiliateMiddleware, requireAffiliate, addAffiliateFilter } = require('../../middleware/affiliate');

const router = express.Router();

// GET /api/admin/categories - List all categories with pagination
router.get('/', affiliateMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, parent_id, global } = req.query;
    const offset = (page - 1) * limit;

    let where = {};
    if (parent_id !== undefined) {
      where.parent_id = parent_id === 'null' ? null : parent_id;
    }
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } }
      ];
    }

    // If global=true or no affiliate context, show all categories the current user has access to
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

      const categories = await Category.findAndCountAll({
        where: affiliateIds.length > 0 ? { ...where, affiliate_id: { [Op.in]: affiliateIds } } : where,
        include: [
          { model: Category, as: 'parent', attributes: ['name', 'slug'] },
          { model: Category, as: 'children', attributes: ['id', 'name', 'slug'] }
        ],
        order: [['sort_order', 'ASC'], ['name', 'ASC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: categories.rows,
        pagination: {
          total: categories.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(categories.count / limit)
        }
      });
    } else {
      // Add affiliate filter for specific affiliate
      where = addAffiliateFilter(where, req.affiliateId);

      const categories = await Category.findAndCountAll({
        where,
        include: [
          { model: Category, as: 'parent', attributes: ['name', 'slug'] },
          { model: Category, as: 'children', attributes: ['id', 'name', 'slug'] }
        ],
        order: [['sort_order', 'ASC'], ['name', 'ASC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: categories.rows,
        pagination: {
          total: categories.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(categories.count / limit)
        }
      });
    }
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/admin/categories/:id - Get single category
router.get('/:id', affiliateMiddleware, requireAffiliate, async (req, res) => {
  try {
    const category = await Category.findOne({
      where: {
        id: req.params.id,
        affiliate_id: req.affiliateId
      },
      include: [
        { model: Category, as: 'parent', attributes: ['name', 'slug'] },
        { model: Category, as: 'children', attributes: ['id', 'name', 'slug'] }
      ]
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/admin/categories - Create new category
router.post('/', hasPermission('categories.create'), async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT /api/admin/categories/:id - Update category
router.put('/:id', hasPermission('categories.update'), async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await category.update(req.body);
    res.json({ success: true, data: category });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE /api/admin/categories/:id - Delete category
router.delete('/:id', hasPermission('categories.delete'), async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await category.destroy();
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router; 