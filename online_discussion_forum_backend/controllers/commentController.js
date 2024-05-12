const User = require('../models/users');
const Instructor = require('../models/instructor')
const Thread = require('../models/threads');
const Comment = require('../models/comments');
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const { gridFSBucket } = global;
const fs = require('fs')
const { v4: uuidv4 } = require('uuid');
const { Readable } = require('stream');

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
    const instructor = await Instructor.findById(req.userId);

    let imageUUID = '';

    console.log(req.file.originalname)
    if (req.file) {
        const originalFilename = req.file.originalname;
        const fileExtension = originalFilename.split('.').pop();
        imageUUID = uuidv4() + '.' + fileExtension;

        const buffer = req.file.buffer;
        const readBufferStream = Readable.from(buffer);

        const uploadStream = global.gridFSBucket.openUploadStream(imageUUID);

        readBufferStream.pipe(uploadStream);

        uploadStream.on('error', (error) => {
            console.error('Error uploading file:', error);
            res.status(500).json({ message: "Failed to upload file" });
        });

        uploadStream.on('finish', async () => {
            console.log('File uploaded successfully');
            // Perform any additional operations after successful upload
        });

        readBufferStream.on('error', (error) => {
            console.error('Error reading file:', error);
            res.status(500).json({ message: "Failed to read file" });
        });
    } else {
        // Handle the case when no file is uploaded
        console.error('No file uploaded');
        res.status(400).json({ message: "No file uploaded" });
    }


    let commentCreator;
    if (user) {
        commentCreator = user;
    } else if (instructor) {
        commentCreator = instructor;
    } else {
        return res.status(400).json({ message: "User or instructor not found" });
    }

    const comment = new Comment({
        _id: new mongoose.Types.ObjectId(),
        user: commentCreator._id,
        username: commentCreator.user_name,
        profile: commentCreator.profile,
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

    if (user) {
        await User.findByIdAndUpdate(req.userId,
            { $push: { comments: comment._id } },
            { new: true }
        )
    } else if (instructor) {
        await Instructor.findByIdAndUpdate(req.userId,
            { $push: { comments: comment._id } },
            { new: true }
        )
    }

    return res.status(200).json({
        message: "Comment has been created",
    })
});



exports.reply_create = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.userId);
    const instructor = await Instructor.findById(req.userId);
    const commentParent = await Comment.findById(req.params.commentId);

    let imageUUID = '';

    console.log(req.files[0].originalname)

    if (req.files) {
        const originalFilename = req.files[0].originalname;
        const fileExtension = originalFilename.split('.').pop();
        imageUUID = uuidv4() + '.' + fileExtension;

        const buffer = req.files[0].buffer;
        const readBufferStream = Readable.from(buffer);

        const uploadStream = global.gridFSBucket.openUploadStream(imageUUID);

        readBufferStream.pipe(uploadStream);

        uploadStream.on('error', (error) => {
            console.error('Error uploading file:', error);
            res.status(500).json({ message: "Failed to upload file" });
        });

        uploadStream.on('finish', async () => {
            console.log('File uploaded successfully');
            // Perform any additional operations after successful upload
        });

        readBufferStream.on('error', (error) => {
            console.error('Error reading file:', error);
            res.status(500).json({ message: "Failed to read file" });
        });
    } else {
        // Handle the case when no file is uploaded
        console.error('No file uploaded');
        res.status(400).json({ message: "No file uploaded" });
    }

    let commentCreator;
    if (user) {
        commentCreator = user;
    } else if (instructor) {
        commentCreator = instructor;
    } else {
        return res.status(400).json({ message: "User or instructor not found" });
    }

    const comment = new Comment({
        _id: new mongoose.Types.ObjectId(),
        user: commentCreator._id,
        username: commentCreator.user_name,
        profile: commentCreator.profile,
        forumPost: req.forumId,
        threadPost: req.threadId,
        parentId: commentParent._id,
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

    await Comment.findByIdAndUpdate(req.params.commentId,
        {
            $push: { replies: comment._id },
            $inc: { commentCount: 1 }
        },
        { new: true }
    );

    if (user) {
        await User.findByIdAndUpdate(req.userId,
            {
                $push: { comments: comment._id },
            },
            { new: true }
        );
    } else if (instructor) {
        await Instructor.findByIdAndUpdate(req.userId,
            {
                $push: { comments: comment._id },
            },
            { new: true }
        );
    }

    return res.status(200).json({
        message: "Comment has been created",
    })
})

/* Update a comment on a certain thread */
exports.comment_update = asyncHandler(async (req, res, next) => {
    const commentId = req.params.commentId;

    console.log('a', req.files[0].originalname)

    if (req.files) {
        const originalFilename = req.files[0].originalname;
        const fileExtension = originalFilename.split('.').pop();
        req.body.image = uuidv4() + '.' + fileExtension;

        const buffer = req.files[0].buffer;
        const readBufferStream = Readable.from(buffer);

        const uploadStream = global.gridFSBucket.openUploadStream(req.body.image);

        readBufferStream.pipe(uploadStream);

        uploadStream.on('error', (error) => {
            console.error('Error uploading file:', error);
            res.status(500).json({ message: "Failed to upload file" });
        });

        uploadStream.on('finish', async () => {
            console.log('File uploaded successfully');
            // Perform any additional operations after successful upload
        });

        readBufferStream.on('error', (error) => {
            console.error('Error reading file:', error);
            res.status(500).json({ message: "Failed to read file" });
        });
    } else {
        // Handle the case when no file is uploaded
        console.error('No file uploaded');
        res.status(400).json({ message: "No file uploaded" });
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

    const user = await User.findById(req.userId);
    const instructor = await Instructor.findById(req.userId);

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
            if (user) {
                await User.findByIdAndUpdate(req.userId,
                    { $pull: { comments: commentId } },
                    { new: true }
                );
            } else if (instructor) {
                await Instructor.findByIdAndUpdate(req.userId,
                    { $pull: { comments: commentId } },
                    { new: true }
                );
            }
        }
        // Remove the comment from its parent's replies array
        if (comment.parentId) {
            await Comment.findByIdAndUpdate(comment.parentId, {
                $pull: { replies: commentId }
            });
            if (user) {
                await User.findByIdAndUpdate(req.userId,
                    { $pull: { comments: commentId } },
                    { new: true }
                );
            } else if (instructor) {
                await Instructor.findByIdAndUpdate(req.userId,
                    { $pull: { comments: commentId } },
                    { new: true }
                );
            }
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

    if (user) {
        await User.findByIdAndUpdate(req.userId,
            { $pull: { comments: commentId } },
            { new: true }
        );
    } else if (instructor) {
        await Instructor.findByIdAndUpdate(req.userId,
            { $pull: { comments: commentId } },
            { new: true }
        );
    }

    return res.status(200).json({
        message: "Comment and its nested replies have been deleted."
    });
});

/* Vote a comment on a certain thread */
exports.comment_vote = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.userId);
    const instructor = await Instructor.findById(req.userId);

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
        return res.status(404).json({ message: "Comment not found." });
    }

    let voter;
    if (user) {
        voter = user;
    } else if (instructor) {
        voter = instructor;
    } else {
        return res.status(400).json({ message: "User or instructor not found" });
    }

    const alreadyUpvoted = comment.upvotedBy.includes(voter._id);
    const alreadyDownvoted = comment.downvotedBy.includes(voter._id);

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
                $pull: { downvotedBy: voter._id },
                $addToSet: { upvotedBy: voter._id }
            });
            res.status(200).json({ message: "Comment upvoted successfully." });
        } else {
            // User hasn't upvoted yet, add the upvote
            await Comment.findByIdAndUpdate(req.params.commentId, {
                $inc: { upvotes: 1 },
                $addToSet: { upvotedBy: voter._id }
            });
            res.status(200).json({ message: "Comment upvoted successfully." });
        }
    } else if (req.body.vote === 'downvote') {
        if (alreadyDownvoted) {
            // User has already downvoted, remove the downvote
            await Comment.findByIdAndUpdate(req.params.commentId, {
                $inc: { downvotes: -1 },
                $pull: { downvotedBy: voter._id }
            });
            res.status(200).json({ message: "Comment downvote removed successfully." });
        } else if (alreadyUpvoted) {
            // User has already upvoted, remove the upvote and add the downvote
            await Comment.findByIdAndUpdate(req.params.commentId, {
                $inc: { upvotes: -1, downvotes: 1 },
                $pull: { upvotedBy: voter._id },
                $addToSet: { downvotedBy: voter._id }
            });
            res.status(200).json({ message: "Comment downvoted successfully." });
        } else {
            // User hasn't downvoted yet, add the downvote
            await Comment.findByIdAndUpdate(req.params.commentId, {
                $inc: { downvotes: 1 },
                $addToSet: { downvotedBy: voter._id }
            });
            res.status(200).json({ message: "Comment downvoted successfully." });
        }
    } else {
        res.status(400).json({ message: "Invalid vote type. Please provide 'upvote' or 'downvote'." });
    }
});
