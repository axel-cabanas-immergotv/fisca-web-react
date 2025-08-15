const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const { uploadImage, deleteFile } = require('../utils/s3');
const { verifyToken, hasPermission } = require('../middleware/auth');
const { File } = require('../models');

const router = express.Router();

// Configure multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// POST /api/upload/image - Upload single image to S3
router.post('/image', verifyToken, hasPermission('stories.create'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image file provided' 
      });
    }

    const { buffer, originalname, mimetype, size } = req.file;
    const folder = req.body.folder || 'images/stories'; // Default folder
    const usageContext = req.body.usage_context || null;

    // Calculate file hash for duplicate detection
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    // Check if file already exists (duplicate detection)
    const existingFile = await File.findOne({ where: { hash } });
    if (existingFile && req.body.check_duplicates !== 'false') {
      console.log('📁 File already exists, returning existing file:', existingFile.filename);
      
      const responseData = {
        success: true,
        data: {
          id: existingFile.id,
          url: existingFile.cdn_url || existingFile.url,
          key: existingFile.key,
          filename: existingFile.filename,
          size: existingFile.size,
          mimetype: existingFile.mimetype,
          duplicate: true
        }
      };
      
      // For Editor.js compatibility
      responseData.file = responseData.data;
      
      return res.json(responseData);
    }

    // Upload to S3
    const result = await uploadImage(buffer, originalname, mimetype, folder);

    if (result.success) {
      // Save file record to database ONLY after successful S3 upload
      const fileRecord = await File.create({
        original_name: originalname,
        filename: result.filename,
        key: result.key,
        url: result.url,
        size: size,
        mimetype: mimetype,
        folder: folder,
        hash: hash,
        user_id: req.user ? req.user.id : null,
        usage_context: usageContext,
        metadata: {
          uploaded_at: new Date().toISOString(),
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        },
        is_active: true
      });

      console.log('📁 File uploaded and saved to database:', {
        id: fileRecord.id,
        filename: fileRecord.filename,
        size: fileRecord.size
      });

      // Response compatible with both Editor.js and dropzone
      const responseData = {
        success: true,
        data: {
          id: fileRecord.id,
          url: fileRecord.cdn_url || fileRecord.url,
          key: fileRecord.key,
          filename: fileRecord.filename,
          size: fileRecord.size,
          mimetype: fileRecord.mimetype,
          duplicate: false
        }
      };

      // For Editor.js compatibility, also include the file object directly
      responseData.file = responseData.data;

      res.json(responseData);
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during upload'
    });
  }
});

// POST /api/upload/images - Upload multiple images
router.post('/images', verifyToken, hasPermission('stories.create'), upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image files provided' 
      });
    }

    const folder = req.body.folder || 'images/stories';
    const uploadPromises = req.files.map(file => 
      uploadImage(file.buffer, file.originalname, file.mimetype, folder)
    );

    const results = await Promise.all(uploadPromises);
    
    const successfulUploads = results.filter(result => result.success);
    const failedUploads = results.filter(result => !result.success);

    res.json({
      success: true,
      message: `${successfulUploads.length} images uploaded successfully`,
      data: {
        uploaded: successfulUploads.map(result => ({
          url: result.url,
          key: result.key,
          filename: result.filename
        })),
        failed: failedUploads.map(result => result.error)
      }
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during upload'
    });
  }
});

// POST /api/upload/by-url - Upload image from URL
router.post('/by-url', verifyToken, hasPermission('stories.create'), async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required'
      });
    }

    // Validate URL format
    let imageUrl;
    try {
      imageUrl = new URL(url);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid URL format'
      });
    }

    // Download image from URL
    const fetch = require('node-fetch');
    const response = await fetch(imageUrl.href);
    
    if (!response.ok) {
      return res.status(400).json({
        success: false,
        message: 'Failed to download image from URL'
      });
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'URL does not point to a valid image'
      });
    }

    const buffer = await response.buffer();
    const originalFilename = imageUrl.pathname.split('/').pop() || 'downloaded-image';
    const folder = req.body.folder || 'images/stories';
    const usageContext = req.body.usage_context || null;

    // Calculate file hash for duplicate detection
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    // Check if file already exists (duplicate detection)
    const existingFile = await File.findOne({ where: { hash } });
    if (existingFile && req.body.check_duplicates !== 'false') {
      console.log('📁 File already exists (from URL), returning existing file:', existingFile.filename);
      
      const responseData = {
        success: true,
        data: {
          id: existingFile.id,
          url: existingFile.cdn_url || existingFile.url,
          key: existingFile.key,
          filename: existingFile.filename,
          size: existingFile.size,
          mimetype: existingFile.mimetype,
          duplicate: true
        }
      };
      
      // For Editor.js compatibility
      responseData.file = responseData.data;
      
      return res.json(responseData);
    }

    // Upload to S3
    const result = await uploadImage(buffer, originalFilename, contentType, folder);

    if (result.success) {
      // Save file record to database ONLY after successful S3 upload
      const fileRecord = await File.create({
        original_name: originalFilename,
        filename: result.filename,
        key: result.key,
        url: result.url,
        size: buffer.length,
        mimetype: contentType,
        folder: folder,
        hash: hash,
        user_id: req.user ? req.user.id : null,
        usage_context: usageContext,
        metadata: {
          uploaded_at: new Date().toISOString(),
          source_url: url,
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        },
        is_active: true
      });

      console.log('📁 File uploaded from URL and saved to database:', {
        id: fileRecord.id,
        filename: fileRecord.filename,
        size: fileRecord.size,
        source_url: url
      });

      // Response compatible with both Editor.js and dropzone
      const responseData = {
        success: true,
        data: {
          id: fileRecord.id,
          url: fileRecord.cdn_url || fileRecord.url,
          key: fileRecord.key,
          filename: fileRecord.filename,
          size: fileRecord.size,
          mimetype: fileRecord.mimetype,
          duplicate: false
        }
      };

      // For Editor.js compatibility, also include the file object directly
      responseData.file = responseData.data;

      res.json(responseData);
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('URL upload error:', error);
    res.status(500).json({
      success: 0,
      message: 'Internal server error during URL upload'
    });
  }
});

// DELETE /api/upload/:key - Delete image from S3 and mark as inactive
router.delete('/:key(*)', verifyToken, hasPermission('stories.delete'), async (req, res) => {
  try {
    const key = req.params.key;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'File key is required'
      });
    }

    // Find file record in database
    const fileRecord = await File.findOne({ where: { key } });
    
    if (!fileRecord) {
      return res.status(404).json({
        success: false,
        message: 'File record not found in database'
      });
    }

    // Mark file as inactive (soft delete)
    await fileRecord.update({ 
      is_active: false,
      deleted_at: new Date()
    });

    // Optionally delete from S3 (uncomment if you want hard delete)
    // const result = await deleteFile(key);
    
    console.log('📁 File marked as deleted:', {
      id: fileRecord.id,
      filename: fileRecord.filename,
      key: fileRecord.key
    });

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during deletion'
    });
  }
});

// GET /api/upload/files - List files for admin
router.get('/files', verifyToken, hasPermission('stories.read'), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      folder, 
      mimetype, 
      user_id,
      usage_context,
      is_active = true 
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { is_active };
    
    if (folder) where.folder = folder;
    if (mimetype) where.mimetype = { [require('sequelize').Op.like]: `${mimetype}%` };
    if (user_id) where.user_id = user_id;
    if (usage_context) where.usage_context = usage_context;
    
    const files = await File.findAndCountAll({
      where,
      include: [
        {
          model: require('../models').User,
          as: 'uploader',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: files.rows,
      pagination: {
        total: files.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(files.count / limit)
      }
    });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router; 