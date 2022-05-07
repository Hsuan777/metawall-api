const express = require('express');
const router = express.Router();
const ImageControllers = require('../controllers/image');
const HttpControllers = require('../controllers/http');
const multer = require('multer');
const upload = multer ({ dest: 'uploads/'})

router.post('/', upload.single('image'), (req, res) => ImageControllers.uploadToImgur(req, res));
router.options('/', (req, res) => HttpControllers.cors(req, res));

module.exports = router;
