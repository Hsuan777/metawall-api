const express = require('express');
const router = express.Router();
const ImageControllers = require('../controllers/image');
const HttpControllers = require('../controllers/http');
const handleErrorAsync = require("../service/handleErrorAsync");
const multer = require('multer');
const upload = multer({
  dest: './uploads/', 
  fileFilter: (req, file, callback) => {
    const fileSize = parseInt(req.headers['content-length']);
    const error = new Error();
    error.isOperational = true;
    if (fileSize >= 10485760) {
      error.message = '檔案需在 10 MB 內';
      return callback(error);
    };
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
      callback(null, true);
    } else {
      error.message = '檔案必須為 .jpg 或 .jpeg 或 .png';
      return callback(error);
    };
    callback(null, true);
  }
});

// router.post('/', upload.single('image'), handleErrorAsync((req, res, next) => ImageControllers.uploadToImgur(req, res, next)));
router.post('/', upload.array('photos', 10), handleErrorAsync((req, res, next) => ImageControllers.upload(req, res, next)));
router.delete('/delete/:id', upload.single('image'), handleErrorAsync((req, res, next) => ImageControllers.deleteImage(req, res, next)));
router.options('/', (req, res) => HttpControllers.cors(req, res));

module.exports = router;
