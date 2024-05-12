const express = require('express');
const thread_controller = require('../controllers/threadController');
const checkAuth = require('../middleware/check-auth');
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
router.get('/all', thread_controller.thread_get_all_forum_all);

/* Get Top Ten Upvoted Threads */
router.get('/topten', thread_controller.thread_get_top_ten_threads);

/* GET request for all threads on a certain forum */
router.get('/', thread_controller.thread_get_all_forum);

/* GET request for a thread on a certain forum */
router.get('/:threadId', thread_controller.thread_get_one_forum);

/* POST request thread create */
router.post('/', checkAuth, upload.array('image'), thread_controller.thread_create);

/* PATCH request for a thread */
router.patch('/:threadId', upload.array('image'), thread_controller.thread_update);

/* DELETE request for thread */
router.delete('/:threadId', thread_controller.thread_delete);

/* Upvote or Dowvote: UPDATE request for thread */
router.patch('/:threadId/vote', thread_controller.thread_vote);

/* Check view: UPDATE request for thread */
router.patch('/:threadId/checkView', thread_controller.thread_check_view);

module.exports = router;