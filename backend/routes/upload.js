const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');
const { BadRequestError, NotFoundError } = require('../utils/errors');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter for image security
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new BadRequestError('Only image files (JPEG, PNG, WebP, GIF, SVG) are allowed!'));
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});

// @desc    Upload single image
// @route   POST /api/upload
// @access  Private/Admin
router.post('/', protect, authorize('admin'), upload.single('image'), (req, res, next) => {
  try {
    if (!req.file) {
      throw new BadRequestError('No file uploaded');
    }

    logger.info(`File uploaded: ${req.file.filename}`);
    res.json({
      success: true,
      image: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
    });
  } catch (error) {
    logger.error('Upload error:', error);
    next(error);
  }
});

// @desc    Upload multiple images
// @route   POST /api/upload/multiple
// @access  Private/Admin
router.post('/multiple', protect, authorize('admin'), upload.array('images', 5), (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new BadRequestError('No files uploaded');
    }

    const images = req.files.map((file) => `/uploads/${file.filename}`);
    logger.info(`${images.length} files uploaded`);

    res.json({
      success: true,
      images,
    });
  } catch (error) {
    logger.error('Upload multiple error:', error);
    next(error);
  }
});

// @desc    Delete image
// @route   DELETE /api/upload/:filename
// @access  Private/Admin
router.delete('/:filename', protect, authorize('admin'), (req, res, next) => {
  try {
    const filename = path.basename(req.params.filename); // Prevents directory traversal
    const filePath = path.join(uploadDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`File deleted: ${filename}`);
      return res.json({
        success: true,
        message: 'File deleted successfully',
      });
    }

    throw new NotFoundError('File');
  } catch (error) {
    logger.error('Delete file error:', error);
    next(error);
  }
});

module.exports = router;
