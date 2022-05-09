var express = require('express');
var router = express.Router();
const UserControllers = require('../controllers/user');
const HttpControllers = require('../controllers/http');
const handleErrorAsync = require("../service/handleErrorAsync");

router.post('/', handleErrorAsync((req, res, next) => UserControllers.addUser(req, res, next)));
router.options('/', (req, res) => HttpControllers.cors(req, res));

module.exports = router;
