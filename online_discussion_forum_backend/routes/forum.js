const express = require('express');
const forum_controller = require('../controllers/forumController');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG and PNG files are allowed'), false);
    }
}

const upload = multer({
    storage: storage, 
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

const router = express.Router();

/* GET requests for all forums */
router.get('/', forum_controller.forum_get);

/* GET request for specific forum */
router.get('/:forumId', forum_controller.forum_get_one);

/* POST request forum create */
router.post('/', upload.single('image'), forum_controller.forum_create);

/* PATCH request forum info */
router.patch('/:forumId', upload.array('image'), forum_controller.forum_patch_info);

/* DELETE request forum */
router.delete('/:forumId', forum_controller.forum_delete);

module.exports = router;