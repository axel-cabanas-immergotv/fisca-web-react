const express = require('express');
const { Op } = require('sequelize');
const { User, Role, Affiliate, UserAffiliate } = require('../../models');
const { hasPermission } = require('../../middleware/auth');
const { affiliateMiddleware, requireAffiliate } = require('../../middleware/affiliate');

const router = express.Router();

// GET /api/admin/users - List all users with pagination
router.get('/', affiliateMiddleware, hasPermission('users.read'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role_id, status, global } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (role_id) where.role_id = role_id;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { username: { [Op.like]: `%${search}%` } }
      ];
    }

    // If global=true or no affiliate context, show all users the current user has access to
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

      const users = await User.findAndCountAll({
        where,
        include: [
          { model: Role, as: 'role' },
          {
            model: Affiliate,
            as: 'affiliates',
            where: affiliateIds.length > 0 ? { id: { [Op.in]: affiliateIds } } : undefined,
            through: { attributes: [] }
          }
        ],
        attributes: { exclude: ['password'] },
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: users.rows,
        pagination: {
          total: users.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(users.count / limit)
        }
      });
    } else {
      // Filter users by specific affiliate relationship
      const users = await User.findAndCountAll({
        where,
        include: [
          { model: Role, as: 'role' },
          {
            model: Affiliate,
            as: 'affiliates',
            where: { id: req.affiliateId },
            through: { attributes: [] }
          }
        ],
        attributes: { exclude: ['password'] },
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: users.rows,
        pagination: {
          total: users.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(users.count / limit)
        }
      });
    }
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/admin/users/:id - Get single user
router.get('/:id', affiliateMiddleware, requireAffiliate, hasPermission('users.read'), async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.params.id },
      include: [
        { model: Role, as: 'role' },
        {
          model: Affiliate,
          as: 'affiliates',
          where: { id: req.affiliateId },
          through: { attributes: [] }
        }
      ],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Add affiliate_ids for easier frontend handling
    const userData = user.toJSON();
    userData.affiliate_ids = user.affiliates ? user.affiliates.map(a => a.id) : [];

    res.json({ success: true, data: userData });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/admin/users - Create new user
router.post('/', hasPermission('users.create'), async (req, res) => {
  try {
    const { affiliate_ids, ...userData } = req.body;
    
    // Create user
    const user = await User.create(userData);
    
    // Handle affiliates if provided
    if (affiliate_ids && Array.isArray(affiliate_ids) && affiliate_ids.length > 0) {
      const affiliateRecords = affiliate_ids.map(affiliateId => ({
        user_id: user.id,
        affiliate_id: affiliateId
      }));
      await UserAffiliate.bulkCreate(affiliateRecords);
    }
    
    // Fetch the created user with role and affiliates
    const createdUser = await User.findByPk(user.id, {
      include: [
        { model: Role, as: 'role' },
        {
          model: Affiliate,
          as: 'affiliates',
          through: { attributes: [] }
        }
      ],
      attributes: { exclude: ['password'] }
    });

    res.status(201).json({ success: true, data: createdUser });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT /api/admin/users/:id - Update user
router.put('/:id', hasPermission('users.update'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { affiliate_ids, ...userData } = req.body;
    
    // Update user
    await user.update(userData);
    
    // Handle affiliates update if provided
    if (affiliate_ids !== undefined) {
      // Remove existing affiliates
      await UserAffiliate.destroy({
        where: { user_id: user.id }
      });
      
      // Add new affiliates if any
      if (Array.isArray(affiliate_ids) && affiliate_ids.length > 0) {
        const affiliateRecords = affiliate_ids.map(affiliateId => ({
          user_id: user.id,
          affiliate_id: affiliateId
        }));
        await UserAffiliate.bulkCreate(affiliateRecords);
      }
    }
    
    // Fetch updated user with role and affiliates
    const updatedUser = await User.findByPk(user.id, {
      include: [
        { model: Role, as: 'role' },
        {
          model: Affiliate,
          as: 'affiliates',
          through: { attributes: [] }
        }
      ],
      attributes: { exclude: ['password'] }
    });

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/:id', hasPermission('users.delete'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent deletion of current user
    if (user.id === req.user.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete your own account' 
      });
    }

    await user.destroy();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router; 