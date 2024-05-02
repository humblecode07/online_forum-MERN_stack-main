const express = require('express');
const router = express.Router();
const refresh_token_controller = require('../controllers/refreshTokenController');

router.get('/', refresh_token_controller.handleRefreshToken);

module.exports = router;