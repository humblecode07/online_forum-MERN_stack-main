const express = require('express');
const user_controller = require('../controllers/userController');
const checkAuth = require('../middleware/check-auth');
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
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG, and GIF files are allowed'), false);
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

/* GET requests for all users*/
router.get('/', user_controller.user_get);

/* GET request for specific user */
router.get('/:userId', user_controller.user_get_one);

/* POST request user create */
router.post('/', upload.single('profile'), user_controller.user_post_create);

/* POST request user change password*/
router.post('/:userId', user_controller.user_post_changepass);

/* PATCH request user update info*/
router.patch('/:userId', upload.single('profile'), user_controller.user_patch_info)

/* DELETE request user*/
router.delete('/:userId', user_controller.user_delete)

module.exports = router;