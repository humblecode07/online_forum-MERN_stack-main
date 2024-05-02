const express = require('express');
const index_controller = require('../controllers/indexController');

const router = express.Router();

/* GET request home page. */
router.get('/', index_controller.home_page);

/* GET request login page*/ 
router.get('/login', index_controller.log_in_page);

/* POST request login page*/ 
router.post('/login', index_controller.log_in);

module.exports = router;
