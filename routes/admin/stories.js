const express = require('express');
const { Op } = require('sequelize');
const { User, Story, Category, UserAffiliate, Affiliate } = require('../../models');
const { hasPermission, canEditOwn } = require('../../middleware/auth');
const { affiliateMiddleware, requireAffiliate, addAffiliateFilter, addAffiliateToData } = require('../../middleware/affiliate');

const router = express.Router();

// GET /api/admin/stories - List stories with pagination and filters
router.get('/', affiliateMiddleware, hasPermission('stories.read'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category_id, search, global } = req.query;
    const offset = (page - 1) * limit;

    let where = {};
    if (status) where.status = status;
    if (category_id) where.category_id = category_id;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { subtitle: { [Op.like]: `%${search}%` } }
      ];
    }

    // If global=true or no affiliate context, show all stories the current user has access to
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

      const stories = await Story.findAndCountAll({
        where: affiliateIds.length > 0 ? { ...where, affiliate_id: { [Op.in]: affiliateIds } } : where,
        include: [
          { model: User, as: 'author', attributes: ['first_name', 'last_name'] },
          { model: Category, as: 'category', attributes: ['name', 'slug', 'color'] }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: stories.rows,
        pagination: {
          total: stories.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(stories.count / limit)
        }
      });
    } else {
      // Add affiliate filter for specific affiliate
      where = addAffiliateFilter(where, req.affiliateId);

      const stories = await Story.findAndCountAll({
        where,
        include: [
          { model: User, as: 'author', attributes: ['first_name', 'last_name'] },
          { model: Category, as: 'category', attributes: ['name', 'slug', 'color'] }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: stories.rows,
        pagination: {
          total: stories.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(stories.count / limit)
        }
      });
    }
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/admin/stories/:id - Get single story
router.get('/:id', affiliateMiddleware, requireAffiliate, hasPermission('stories.read'), async (req, res) => {
  try {
    const story = await Story.findOne({
      where: {
        id: req.params.id,
        affiliate_id: req.affiliateId
      },
      include: [
        { model: User, as: 'author', attributes: ['first_name', 'last_name'] },
        { model: Category, as: 'category' }
      ]
    });

    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    res.json({ success: true, data: story });
  } catch (error) {
    console.error('Get story error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/admin/stories - Create new story
router.post('/', affiliateMiddleware, requireAffiliate, hasPermission('stories.create'), async (req, res) => {
  try {
    const storyData = addAffiliateToData({
      ...req.body,
      author_id: req.user.id
    }, req.affiliateId);

    // Generate slug if not provided
    if (!storyData.slug && storyData.title) {
      storyData.slug = storyData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
    }

    const story = await Story.create(storyData);

    // Fetch the created story with associations
    const createdStory = await Story.findByPk(story.id, {
      include: [
        { model: User, as: 'author', attributes: ['first_name', 'last_name'] },
        { model: Category, as: 'category' }
      ]
    });

    res.status(201).json({ success: true, data: createdStory });
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT /api/admin/stories/:id - Update story
router.put('/:id', affiliateMiddleware, requireAffiliate, hasPermission('stories.update'), async (req, res) => {
  try {
    const story = await Story.findOne({
      where: {
        id: req.params.id,
        affiliate_id: req.affiliateId
      }
    });
    
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    // Check if user can edit this story (own story or has update_all permission)
    const canEditAll = req.user.permissions?.some(p => p.name === 'stories.update_all');
    if (!canEditAll && story.author_id !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only edit your own stories' 
      });
    }

    await story.update(req.body);

    // Fetch updated story with associations
    const updatedStory = await Story.findByPk(story.id, {
      include: [
        { model: User, as: 'author', attributes: ['first_name', 'last_name'] },
        { model: Category, as: 'category' }
      ]
    });

    res.json({ success: true, data: updatedStory });
  } catch (error) {
    console.error('Update story error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE /api/admin/stories/:id - Delete story
router.delete('/:id', affiliateMiddleware, requireAffiliate, hasPermission('stories.delete'), async (req, res) => {
  try {
    const story = await Story.findOne({
      where: {
        id: req.params.id,
        affiliate_id: req.affiliateId
      }
    });
    
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    // Check if user can delete this story (own story or has delete_all permission)
    const canDeleteAll = req.user.permissions?.some(p => p.name === 'stories.delete_all');
    if (!canDeleteAll && story.author_id !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only delete your own stories' 
      });
    }

    await story.destroy();
    res.json({ success: true, message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router; 