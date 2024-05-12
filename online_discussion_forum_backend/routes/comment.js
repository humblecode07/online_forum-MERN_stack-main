const express = require('express');
const comment_controller = require('../controllers/commentController');
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

const router = express.Router();

/* GET request for all threads in all forums */
router.get('/all', comment_controller.comment_get_all_thread_all);

/* GET requests for all comments on a certain thread */
router.get('/', comment_controller.comment_get_all);

/* GET requests for comment on a certain thread */
router.get('/:commentId', comment_controller.comment_get_one);

/* POST request for creating a comment on a thread */
router.post('/', upload.single('image'), comment_controller.comment_create);

/* POST request for creating a reply on a comment */
router.post('/:commentId', upload.array('image'), comment_controller.reply_create);

/* PATCH request for updating a comment on a thread */
router.patch('/:commentId', upload.array('image'), comment_controller.comment_update);

/* DELETE request for deleting a comment on a thread */
router.delete('/:commentId', comment_controller.comment_delete);

/* Upvote or Dowvote: UPDATE request for comment */
router.patch('/:commentId/vote', comment_controller.comment_vote);

module.exports = router;