const express = require('express');
const router = express.Router();
const logout_controller = require('../controllers/logOutController');

router.get('/', logout_controller.handleLogout);

module.exports = router;