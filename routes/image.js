const express = require('express');
const router = express.Router();
const ImageControllers = require('../controllers/image');
const HttpControllers = require('../controllers/http');
const handleErrorAsync = require("../service/handleErrorAsync");
const upload = require('../service/upload');

router.post('/', upload.array('photos', 10), handleErrorAsync((req, res, next) => ImageControllers.upload(req, res, next)));
router.delete('/', handleErrorAsync((req, res, next) => ImageControllers.delete(req, res, next)));
router.options('/', (req, res) => HttpControllers.cors(req, res));

module.exports = router;
