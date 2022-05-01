var express = require('express');
var router = express.Router();
const UserControllers = require('../controllers/user');
const HttpControllers = require('../controllers/http');

router.post('/', (req, res) => UserControllers.addUser(req, res));
router.options('/', (req, res) => HttpControllers.cors(req, res));

module.exports = router;
