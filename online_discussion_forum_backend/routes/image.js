const express = require('express');
const image_controller = require('../controllers/imageController');
const { gridFSBucket } = global;
const router = express.Router();

console.log(gridFSBucket)

router.get('/:filename', image_controller.get_image);

module.exports = router;
