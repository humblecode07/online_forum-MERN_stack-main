const express = require('express');
const router = express.Router();
const instructor_controller = require('../controllers/instructorController')
const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 5 // 5 MB
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG and PNG files are allowed'));
        }
    }
});

/* GET requests for all instructor*/
router.get('/', instructor_controller.instructor_get);

/* GET request for specific instructor */
router.get('/:instructorId', instructor_controller.instructor_get_one);

/* POST request instructor create */
router.post('/', upload.single('profile'), instructor_controller.instructor_post_create);

/* POST request instructor change password*/
router.post('/:instructorId', instructor_controller.instructor_post_changepass);

/* PATCH request instructor update info*/
router.patch('/:instructorId', upload.single('profile'), instructor_controller.instructor_patch_info)

/* DELETE request instructor*/
router.delete('/:instructorId', instructor_controller.instructor_delete);

module.exports = router;