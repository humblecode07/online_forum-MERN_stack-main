const User = require('../models/users');
const Thread = require('../models/threads');
const Comment = require('../models/comments');
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const { gridFSBucket } = global;
const fs = require('fs')
const { v4: uuidv4 } = require('uuid');

/* Get all threads in all threads */
exports.comment_get_all_thread_all = asyncHandler(async (req, res, next) => {
    const comments = await Comment.find().exec();

    const commentCount = comments.length;

    return res.status(200).json({
        comments,
        commentCount
    });
});

/* Get all comments on a certain thread */
exports.comment_get_all = asyncHandler(async (req, res, next) => {
    const threadId = req.threadId;

    const thread = await Thread.findById(threadId).exec();

    if (!thread) {
        return res.status(404).json({ message: "Thread not found" });
    }
    const comments = await Comment.find({ threadPost: threadId }).exec();
    const commentCount = comments.length;



    return res.status(200).json({ comments, commentCount });
});

/* Get certain comment on a certain thread */
exports.comment_get_one = asyncHandler(async (req, res, next) => {
    const commentId = req.params.commentId;

    const comment = await Comment.findById(commentId).exec();

    if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
    }
    const comments = await Comment.find({ _id: commentId }).exec();

    return res.status(200).json({ comment });
});

/* Create a comment on a certain thread */
exports.comment_create = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.userId);

    let imageUUID = '';

    if (req.file) {
        const originalFilename = req.file.originalname;
        const fileExtension = originalFilename.split('.').pop();
        imageUUID = uuidv4() + '.' + fileExtension;

        const readStream = fs.createReadStream(req.file.path);
        const uploadStream = global.gridFSBucket.openUploadStream(imageUUID);

        readStream.pipe(uploadStream);

        uploadStream.on('error', (error) => {
            console.error('Error uploading file:', error);
            res.status(500).json({ message: "Failed to upload file" });
        });

        uploadStream.on('finish', async () => {
            console.log('File uploaded successfully');
        });

        readStream.on('error', (error) => {
            console.error('Error reading file:', error);
            res.status(500).json({ message: "Failed to read file" });
        });
    }

    const comment = new Comment({
        _id: new mongoose.Types.ObjectId(),
        user: user._id,
        username: user.user_name,
        profile: user.profile,
        forumPost: req.forumId,
        threadPost: req.threadId,
        parentId: null,
        content: req.body.content,
        image: imageUUID
    });

    await comment.save();

    await Thread.findByIdAndUpdate(req.threadId,
        {
            $push: { comments: comment._id },
            $inc: { commentCount: 1 }
        },
        { new: true }
    );

    await User.findByIdAndUpdate(req.userId, 
        { $push: { comments: comment._id } }, 
        { new: true }
    )

    return res.status(200).json({
        message: "Comment has been created",
    })
});


exports.reply_create = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.userId);
    const commentParent = await Comment.findById(req.params.commentId);

    let image = '';

    if (req.files.length > 0) {
        image = req.files[0].path;
    }

    const comment = new Comment({
        _id: new mongoose.Types.ObjectId(),
        user: user._id,
        username: user.user_name,
        profile: user.profile,
        forumPost: req.forumId,
        threadPost: req.threadId,
        parentId: commentParent._id,
        content: req.body.content,
        image: image
    });

    await comment.save();

    await Thread.findByIdAndUpdate(req.threadId,
        {
            $push: { comments: comment._id },
            $inc: { commentCount: 1 }
        },
        { new: true }
    );

    await Comment.findByIdAndUpdate(req.params.commentId,
        {
            $push: { replies: comment._id },
            $inc: { commentCount: 1 }
        },
        { new: true }
    );

    await User.findByIdAndUpdate(req.userId,
        {
            $push: { comments: comment._id },
        },
        { new: true }
    );

    return res.status(200).json({
        message: "Comment has been created",
    })
})

/* Update a comment on a certain thread */
exports.comment_update = asyncHandler(async (req, res, next) => {
    const commentId = req.params.commentId;

    let image = '';

    if (req.files.length > 0) {
        image = req.files[0].path;
        req.body.image = image;
    }


    const updatedComment = await Comment.findByIdAndUpdate(commentId, {
        $set: req.body,
        editedAt: Date.now()
    }, { new: true });

    if (!updatedComment) {
        return res.status(404).json({ message: "Comment not found" });
    }

    return res.status(200).json({
        message: "Comment has been updated.",
        user: updatedComment
    })
});

/* Delete a comment on a certain thread */
exports.comment_delete = asyncHandler(async (req, res, next) => {
    const threadId = req.threadId;
    const commentId = req.params.commentId;

    // Function to recursively delete nested replies and update parent comments
    const deleteRepliesAndUpdateParentComments = async (commentId) => {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return; // If comment not found, return
        }
        // Recursively delete each reply
        for (const replyId of comment.replies) {
            await deleteRepliesAndUpdateParentComments(replyId);
            await Comment.findByIdAndDelete(replyId); // Delete the reply
            await Thread.findByIdAndUpdate(threadId,
                { $pull: { replies: commentId }, $inc: { commentCount: -1 } },
                { new: true }
            );
            await User.findByIdAndUpdate(req.userId,
                { $pull: { comments: commentId } },
                { new: true }
            );
        }
        // Remove the comment from its parent's replies array
        if (comment.parentId) {
            await Comment.findByIdAndUpdate(comment.parentId, {
                $pull: { replies: commentId }
            });
            await User.findByIdAndUpdate(req.userId, {
                $pull: { comments: commentId }
            });
        }
    };

    // Delete the comment and its nested replies
    await deleteRepliesAndUpdateParentComments(commentId);
    await Comment.findByIdAndDelete(commentId);

    // Remove the comment from the thread's replies array and update replyCount
    await Thread.findByIdAndUpdate(threadId,
        { $pull: { replies: commentId }, $inc: { commentCount: -1 } },
        { new: true }
    );

    await User.findByIdAndUpdate(req.userId,
        { $pull: { comments: commentId } },
        { new: true }
    );

    // Implement storage for deleted comments.

    return res.status(200).json({
        message: "Comment and its nested replies have been deleted."
    });
});


exports.comment_vote = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.userId);

    console.log('userid:', user._id)

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
        return res.status(404).json({ message: "Comment not found." });
    }

    const alreadyUpvoted = comment.upvotedBy.includes(user._id);
    const alreadyDownvoted = comment.downvotedBy.includes(user._id);

    if (req.body.vote === 'upvote') {
        if (alreadyUpvoted) {
            // User has already upvoted, remove the upvote
            await Comment.findByIdAndUpdate(req.params.commentId, {
                $inc: { upvotes: -1 },
                $pull: { upvotedBy: user._id }
            });
            res.status(200).json({ message: "Comment upvote removed successfully." });
        } else if (alreadyDownvoted) {
            // User has already downvoted, remove the downvote and add the upvote
            await Comment.findByIdAndUpdate(req.params.commentId, {
                $inc: { downvotes: -1, upvotes: 1 },
                $pull: { downvotedBy: user._id },
                $addToSet: { upvotedBy: user._id }
            });
            res.status(200).json({ message: "Comment upvoted successfully." });
        } else {
            // User hasn't upvoted yet, add the upvote
            await Comment.findByIdAndUpdate(req.params.commentId, {
                $inc: { upvotes: 1 },
                $addToSet: { upvotedBy: user._id }
            });
            res.status(200).json({ message: "Comment upvoted successfully." });
        }
    } else if (req.body.vote === 'downvote') {
        if (alreadyDownvoted) {
            // User has already downvoted, remove the downvote
            await Comment.findByIdAndUpdate(req.params.commentId, {
                $inc: { downvotes: -1 },
                $pull: { downvotedBy: user._id }
            });
            res.status(200).json({ message: "Comment downvote removed successfully." });
        } else if (alreadyUpvoted) {
            // User has already upvoted, remove the upvote and add the downvote
            await Comment.findByIdAndUpdate(req.params.commentId, {
                $inc: { upvotes: -1, downvotes: 1 },
                $pull: { upvotedBy: user._id },
                $addToSet: { downvotedBy: user._id }
            });
            res.status(200).json({ message: "Comment downvoted successfully." });
        } else {
            // User hasn't downvoted yet, add the downvote
            await Comment.findByIdAndUpdate(req.params.commentId, {
                $inc: { downvotes: 1 },
                $addToSet: { downvotedBy: user._id }
            });
            res.status(200).json({ message: "Comment downvoted successfully." });
        }
    } else {
        res.status(400).json({ message: "Invalid vote type. Please provide 'upvote' or 'downvote'." });
    }
});
