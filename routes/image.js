const express = require('express');
const router = express.Router();
const ImageControllers = require('../controllers/image');
const HttpControllers = require('../controllers/http');
const handleErrorAsync = require("../service/handleErrorAsync");
const multer = require('multer');
const upload = multer({dest: './uploads/'})

router.post('/', upload.single('image'), handleErrorAsync((req, res, next) => ImageControllers.uploadToImgur(req, res, next)));
router.options('/', (req, res) => HttpControllers.cors(req, res));

module.exports = router;
