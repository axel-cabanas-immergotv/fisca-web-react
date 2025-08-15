const express = require('express');
const { Op } = require('sequelize');
const { User, Module } = require('../../models');
const { hasPermission } = require('../../middleware/auth');
const { affiliateMiddleware, requireAffiliate, addAffiliateFilter } = require('../../middleware/affiliate');

const router = express.Router();

// GET /api/admin/modules - List all modules with pagination
router.get('/', affiliateMiddleware, requireAffiliate, hasPermission('modules.read'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, type } = req.query;
    const offset = (page - 1) * limit;

    let where = {};
    if (type) where.type = type;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { type: { [Op.like]: `%${search}%` } }
      ];
    }

    // Add affiliate filter
    where = addAffiliateFilter(where, req.affiliateId);

    const modules = await Module.findAndCountAll({
      where,
      include: [
        { model: User, as: 'author', attributes: ['first_name', 'last_name'] }
      ],
      order: [['type', 'ASC'], ['sort_order', 'ASC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: modules.rows,
      pagination: {
        total: modules.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(modules.count / limit)
      }
    });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/admin/modules/:id - Get single module
router.get('/:id', affiliateMiddleware, requireAffiliate, hasPermission('modules.read'), async (req, res) => {
  try {
    const module = await Module.findOne({
      where: {
        id: req.params.id,
        affiliate_id: req.affiliateId
      },
      include: [{ model: User, as: 'author' }]
    });

    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    res.json({ success: true, data: module });
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/admin/modules - Create new module (DISABLED)
router.post('/', hasPermission('modules.create'), async (req, res) => {
  res.status(403).json({ 
    success: false, 
    message: 'Modules cannot be created. They are system entities that can only be edited.' 
  });
});

// PUT /api/admin/modules/:id - Update module
router.put('/:id', hasPermission('modules.update'), async (req, res) => {
  try {
    const module = await Module.findByPk(req.params.id);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    await module.update(req.body);
    
    // Fetch the updated module with author info
    const updatedModule = await Module.findByPk(req.params.id, {
      include: [{ model: User, as: 'author' }]
    });

    res.json({ success: true, data: updatedModule });
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE /api/admin/modules/:id - Delete module (DISABLED)
router.delete('/:id', hasPermission('modules.delete'), async (req, res) => {
  res.status(403).json({ 
    success: false, 
    message: 'Modules cannot be deleted. They are system entities that can only be edited.' 
  });
});

module.exports = router; 