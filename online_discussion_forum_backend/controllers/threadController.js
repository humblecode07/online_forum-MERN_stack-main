const User = require('../models/users');
const Instructor = require('../models/instructor');
const Forum = require('../models/forums');
const Thread = require('../models/threads');
const Comment = require('../models/comments');
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const { gridFSBucket } = global;
const fs = require('fs')
const { v4: uuidv4 } = require('uuid');
const { Readable } = require('stream');

/* Get all threads in all forums */
exports.thread_get_all_forum_all = asyncHandler(async (req, res, next) => {
    const threads = await Thread.find().exec();

    const threadCount = threads.length;

    return res.status(200).json({
        threads,
        threadCount
    });
});


/* Get all threads in a certain forum */
exports.thread_get_all_forum = asyncHandler(async (req, res, next) => {
    const [thread, threadCount] = await Promise.all([
        Thread.find({ forumPost: req.forumId }).sort({ timestamp: -1 }).exec(),
        Thread.countDocuments({ forumPost: req.forumId }).exec()
    ]);

    return res.status(201).json({
        threadCount,
        thread
    });
});


/* Get a thread in a certain forum */
exports.thread_get_one_forum = asyncHandler(async (req, res, next) => {
    const thread = await Thread.findById(req.params.threadId)
        .populate('comments')
        .populate('forumPost')
        .exec();

    return res.status(200).json({
        thread
    });
});

/* Create a thread */
exports.thread_create = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.userId);
    const instructor = await Instructor.findById(req.userId);

    if (!req.body.title) {
        return res.status(400).json({ message: "Title is required" });
    }

    let imageUUID = [];

    if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
            const originalFilename = file.originalname;
            const fileExtension = originalFilename.split('.').pop();
            const uuid = uuidv4() + '.' + fileExtension;

            const buffer = file.buffer;
            const readBufferStream = Readable.from(buffer);

            const uploadStream = global.gridFSBucket.openUploadStream(uuid);

            readBufferStream.pipe(uploadStream);

            uploadStream.on('error', (error) => {
                console.error('Error uploading file:', error);
                res.status(500).json({ message: "Failed to upload file" });
                uploadStream.abort(); // Close the upload stream in case of error
            });

            uploadStream.on('finish', async () => {
                console.log('File uploaded successfully');
            });

            readBufferStream.on('error', (error) => {
                console.error('Error reading file:', error);
                res.status(500).json({ message: "Failed to read file" });
                uploadStream.abort(); // Close the upload stream in case of error
            });

            imageUUID.push(uuid);
        });
    }

    let threadCreator;
    if (user) {
        threadCreator = user;
    } else if (instructor) {
        threadCreator = instructor;
    } else {
        return res.status(500).json({ message: "Failed to create thread" });
    }

    const thread = new Thread({
        _id: new mongoose.Types.ObjectId(),
        user: threadCreator._id,
        username: threadCreator.user_name,
        forumPost: req.forumId,
        title: req.body.title,
        content: req.body.content,
        image: imageUUID
    });

    await thread.save();

    await Forum.findByIdAndUpdate(req.forumId,
        { $push: { threads: thread._id } },
        { new: true }
    );

    if (user) {
        await User.findByIdAndUpdate(req.userId,
            { $push: { threads: thread._id } },
            { new: true }
        )
    } else if (instructor) {
        await Instructor.findByIdAndUpdate(req.userId,
            { $push: { threads: thread._id } },
            { new: true }
        )
    }

    return res.status(200).json({
        message: "Thread, " + req.body.title + ", has been created",
    })
});


/* Update a thread */
exports.thread_update = asyncHandler(async (req, res, next) => {
    const threadId = req.params.threadId;

    let imageUUIDs = [];

    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            const originalFilename = file.originalname;
            const fileExtension = originalFilename.split('.').pop();
            const uuid = uuidv4() + '.' + fileExtension;

            const buffer = file.buffer;
            const readBufferStream = Readable.from(buffer);

            const uploadStream = global.gridFSBucket.openUploadStream(uuid);

            readBufferStream.pipe(uploadStream);

            await new Promise((resolve, reject) => {
                uploadStream.on('error', (error) => {
                    console.error('Error uploading file:', error);
                    reject(error);
                });

                uploadStream.on('finish', async () => {
                    console.log('File uploaded successfully');
                    imageUUIDs.push(uuid);
                    resolve();
                });

                readBufferStream.on('error', (error) => {
                    console.error('Error reading file:', error);
                    reject(error);
                });
            });
        }
    }

    // Update the 'image' field in the thread document with the UUIDs of uploaded images
    if (imageUUIDs.length > 0) {
        req.body.image = imageUUIDs;
    }

    const updatedThread = await Thread.findByIdAndUpdate(threadId, {
        $set: { ...req.body, editedAt: Date.now(), edited: true },
    }, { new: true });

    if (!updatedThread) {
        return res.status(404).json({ message: "Thread not found" });
    }

    return res.status(200).json({
        message: "Thread info has been updated.",
        thread: updatedThread
    });
});


/* Delete a thread */
exports.thread_delete = asyncHandler(async (req, res, next) => {
    const threadId = req.params.threadId;
    const user = await User.findById(req.userId);
    const instructor = await Instructor.findById(req.userId);

    let users, model;

    if (user) {
        model = User;
        users = await User.find({ upvotedThreads: threadId });
    } else if (instructor) {
        model = Instructor;
        users = await Instructor.find({ upvotedThreads: threadId });
    } else {
        return res.status(400).json({ message: "User or instructor not found" });
    }

    for (const user of users) {
        await model.findByIdAndUpdate(user._id,
            { $pull: { upvotedThreads: threadId, downvotedThreads: threadId } },
            { new: true }
        );
    }

    try {
        const thread = await Thread.findById(threadId);
        if (!thread) {
            return res.status(404).json({ message: "Thread not found" });
        }

        await Thread.findByIdAndDelete(threadId);
        await Comment.deleteMany({ threadPost: threadId });

        const forumId = req.forumId;
        await Forum.findByIdAndUpdate(forumId,
            { $pull: { threads: threadId } },
            { new: true }
        );

        await model.findByIdAndUpdate(req.userId,
            { $pull: { threads: thread._id } },
            { new: true }
        );

        return res.status(200).json({
            message: "Thread info has been deleted.",
            thread: thread
        });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting thread" });
    }
});


/* Upvote or Downvote a Thread */
exports.thread_vote = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.userId);
    const instructor = await Instructor.findById(req.userId);

    const thread = await Thread.findById(req.params.threadId);
    if (!thread) {
        return res.status(404).json({ message: "Thread not found." });
    }

    let voter;
    if (user) {
        voter = user;
    } else if (instructor) {
        voter = instructor;
    } else {
        return res.status(400).json({ message: "User or instructor not found" });
    }

    const alreadyUpvoted = thread.upvotedBy.includes(voter._id);
    const alreadyDownvoted = thread.downvotedBy.includes(voter._id);

    if (req.body.vote === 'upvote') {
        if (alreadyUpvoted) {
            await Thread.findByIdAndUpdate(req.params.threadId, {
                $inc: { upvotes: -1 },
                $pull: { upvotedBy: user._id }
            });
            if (user) {
                await User.findByIdAndUpdate(req.userId, {
                    $pull: { upvotedThreads: thread._id }
                });
            } else if (instructor) {
                await Instructor.findByIdAndUpdate(req.userId, {
                    $pull: { upvotedThreads: thread._id }
                });
            }
            res.status(200).json({ message: "Thread upvote removed successfully." });
        } else if (alreadyDownvoted) {
            // User has already downvoted, remove the downvote and add the upvote
            await Thread.findByIdAndUpdate(req.params.threadId, {
                $inc: { downvotes: -1, upvotes: 1 },
                $pull: { downvotedBy: voter._id },
                $addToSet: { upvotedBy: voter._id }
            });
            if (user) {
                await User.findByIdAndUpdate(req.userId, {
                    $pull: { downvotedThreads: thread._id },
                    $addToSet: { upvotedThreads: thread._id }
                });
            } else if (instructor) {
                await Instructor.findByIdAndUpdate(req.userId, {
                    $pull: { downvotedThreads: thread._id },
                    $addToSet: { upvotedThreads: thread._id }
                });
            }
            res.status(200).json({ message: "Thread upvoted successfully." });
        } else {
            // User hasn't upvoted yet, add the upvote
            await Thread.findByIdAndUpdate(req.params.threadId, {
                $inc: { upvotes: 1 },
                $addToSet: { upvotedBy: voter._id }
            });
            if (user) {
                await User.findByIdAndUpdate(req.userId, {
                    $addToSet: { upvotedThreads: thread._id }
                });
            } else if (instructor) {
                await Instructor.findByIdAndUpdate(req.userId, {
                    $addToSet: { upvotedThreads: thread._id }
                });
            }
            res.status(200).json({ message: "Thread upvoted successfully." });
        }
    } else if (req.body.vote === 'downvote') {
        if (alreadyDownvoted) {
            // User has already downvoted, remove the downvote
            await Thread.findByIdAndUpdate(req.params.threadId, {
                $inc: { downvotes: -1 },
                $pull: { downvotedBy: voter._id }
            });
            if (user) {
                await User.findByIdAndUpdate(req.userId, {
                    $pull: { downvotedThreads: thread._id }
                });
            } else if (instructor) {
                await Instructor.findByIdAndUpdate(req.userId, {
                    $pull: { downvotedThreads: thread._id }
                });
            }
            res.status(200).json({ message: "Thread downvote removed successfully." });
        } else if (alreadyUpvoted) {
            // User has already upvoted, remove the upvote and add the downvote
            await Thread.findByIdAndUpdate(req.params.threadId, {
                $inc: { upvotes: -1, downvotes: 1 },
                $pull: { upvotedBy: voter._id },
                $addToSet: { downvotedBy: voter._id }
            });
            if (user) {
                await User.findByIdAndUpdate(req.userId, {
                    $pull: { upvotedThreads: thread._id },
                    $addToSet: { downvotedThreads: thread._id }
                });
            } else if (instructor) {
                await Instructor.findByIdAndUpdate(req.userId, {
                    $pull: { upvotedThreads: thread._id },
                    $addToSet: { downvotedThreads: thread._id }
                });
            }
            res.status(200).json({ message: "Thread downvoted successfully." });
        } else {
            // User hasn't downvoted yet, add the downvote
            await Thread.findByIdAndUpdate(req.params.threadId, {
                $inc: { downvotes: 1 },
                $addToSet: { downvotedBy: voter._id }
            });
            if (user) {
                await User.findByIdAndUpdate(req.userId, {
                    $addToSet: { downvotedThreads: thread._id }
                });
            } else if (instructor) {
                await Instructor.findByIdAndUpdate(req.userId, {
                    $addToSet: { downvotedThreads: thread._id }
                });
            }
            res.status(200).json({ message: "Thread downvoted successfully." });
        }
    } else {
        res.status(400).json({ message: "Invalid vote type. Please provide 'upvote' or 'downvote'." });
    }
});

/* Get Top Ten Upvotes my dudes */
exports.thread_get_top_ten_threads = asyncHandler(async (req, res, next) => {
    try {
        const topThreads = await Thread.find().sort({ upvotes: -1 }).limit(10);
        res.json({ topThreads });
    } catch (error) {
        console.error('Error fetching top threads:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

exports.thread_check_view = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.userId);
    const instructor = await Instructor.findById(req.userId);
    const thread = await Thread.findById(req.params.threadId);

    let checkUser;
    if (user) {
        checkUser = user;
    }
    else if (instructor) {
        checkUser = instructor;
    }

    if (!checkUser || !thread) {
        return res.status(404).json({ message: "User or thread not found." });
    }

    if (!thread.viewBy || !thread.viewBy.includes(checkUser._id)) {
        await Thread.findByIdAndUpdate(req.params.threadId, {
            $push: { viewBy: checkUser._id },
            $inc: { viewCount: 1 }
        });
    }

    res.status(200).json({ message: "Thread view checked successfully." });
});

