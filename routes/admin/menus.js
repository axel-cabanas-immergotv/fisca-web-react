const express = require('express');
const { Op } = require('sequelize');
const { Menu, Category } = require('../../models');
const { hasPermission } = require('../../middleware/auth');
const { affiliateMiddleware, requireAffiliate, addAffiliateFilter } = require('../../middleware/affiliate');

const router = express.Router();

// GET /api/admin/menus - List menus with pagination and filters
router.get('/', affiliateMiddleware, requireAffiliate, hasPermission('menus.read'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, platform, category_id, search } = req.query;
    const offset = (page - 1) * limit;

    let where = {};
    if (status) where.status = status;
    if (platform) where.platform = platform;
    if (category_id) where.category_id = category_id;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { link: { [Op.like]: `%${search}%` } }
      ];
    }

    // Add affiliate filter
    where = addAffiliateFilter(where, req.affiliateId);

    const menus = await Menu.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['name', 'slug', 'color'] }
      ],
      order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: menus.rows,
      pagination: {
        total: menus.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(menus.count / limit)
      }
    });
  } catch (error) {
    console.error('Get menus error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/admin/menus/:id - Get single menu
router.get('/:id', affiliateMiddleware, requireAffiliate, hasPermission('menus.read'), async (req, res) => {
  try {
    const menu = await Menu.findOne({
      where: {
        id: req.params.id,
        affiliate_id: req.affiliateId
      },
      include: [
        { model: Category, as: 'category' }
      ]
    });

    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }

    res.json({ success: true, data: menu });
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/admin/menus - Create new menu
router.post('/', hasPermission('menus.create'), async (req, res) => {
  try {
    const menuData = {
      ...req.body
    };

    const menu = await Menu.create(menuData);

    // Fetch the created menu with associations
    const createdMenu = await Menu.findByPk(menu.id, {
      include: [
        { model: Category, as: 'category' }
      ]
    });

    res.status(201).json({ success: true, data: createdMenu });
  } catch (error) {
    console.error('Create menu error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT /api/admin/menus/:id - Update menu
router.put('/:id', hasPermission('menus.update'), async (req, res) => {
  try {
    const menu = await Menu.findByPk(req.params.id);
    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }

    await menu.update(req.body);

    // Fetch updated menu with associations
    const updatedMenu = await Menu.findByPk(menu.id, {
      include: [
        { model: Category, as: 'category' }
      ]
    });

    res.json({ success: true, data: updatedMenu });
  } catch (error) {
    console.error('Update menu error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE /api/admin/menus/:id - Delete menu
router.delete('/:id', hasPermission('menus.delete'), async (req, res) => {
  try {
    const menu = await Menu.findByPk(req.params.id);
    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }

    await menu.destroy();
    res.json({ success: true, message: 'Menu deleted successfully' });
  } catch (error) {
    console.error('Delete menu error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router; 