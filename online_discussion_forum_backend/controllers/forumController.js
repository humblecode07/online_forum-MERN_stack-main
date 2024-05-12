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

/* Display all forums */
exports.forum_get = asyncHandler(async (req, res, next) => {
    const [forums, forumCount] = await Promise.all([
        Forum.find().exec(),
        Forum.countDocuments().exec()
    ]);

    return res.status(201).json({
        forumCount,
        forums
    });
});

/* Display a forum */
exports.forum_get_one = asyncHandler(async (req, res, next) => {
    const { forumId } = req.params;
    const forum = await Forum.find({_id: forumId}).exec();

    if (!forum) {
        return res.status(404).json({ message: "User not found" });
    }

    return res.status(201).json({
        forum: forum
    });
});

/* Create forum */
exports.forum_create = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.userId);
    const instructor = await Instructor.findById(req.userId);

    if (!req.body.name || !req.body.description) {
        return res.status(400).json({ message: "Name and description are required" });
    }

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

    const creationTime = new Date();

    let forumCreator;
    if (user) {
        forumCreator = user;
    } else if (instructor) {
        forumCreator = instructor;
    } else {
        return res.status(400).json({ message: "User or instructor not found" });
    }

    const forum = new Forum({
        _id: new mongoose.Types.ObjectId(),
        user: forumCreator._id,
        name: req.body.name,
        image: imageUUID, // Use the same UUID for the image
        creator: forumCreator.first_name + " " + forumCreator.family_name,
        description: req.body.description,
        creationTime: creationTime,
        type: req.body.type // Validate if necessary
    });

    // Save forum instance
    try {
        await forum.save();
        return res.status(200).json({
            message: "Forum, " + req.body.name + ", has been created",
        });
    } catch (error) {
        console.error('Error saving forum:', error);
        return res.status(500).json({ message: "Failed to create forum" });
    }
});



/* Edit forum detail */
exports.forum_patch_info = asyncHandler(async (req, res, next) => {
    const { forumId } = req.params;

    let imageUUID = '';

    console.log(req.files[0].originalname)
    if (req.files) {
        const originalFilename = req.files[0].originalname;
        const fileExtension = originalFilename.split('.').pop();
        imageUUID = uuidv4() + '.' + fileExtension;

        const buffer = req.files[0].buffer;
        const readBufferStream = Readable.from(buffer);

        console.log(imageUUID)
        const uploadStream = global.gridFSBucket.openUploadStream(imageUUID);

        readBufferStream.pipe(uploadStream);

        uploadStream.on('error', (error) => {
            console.error('Error uploading file:', error);
            res.status(500).json({ message: "Failed to upload file" });
        });

        uploadStream.on('finish', async () => {
            console.log('File uploaded successfully');
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


    if (imageUUID) {
        req.body.image = imageUUID;
    }

    const updatedForum = await Forum.findByIdAndUpdate({ _id: forumId }, {
        $set: req.body,
        editedAt: Date.now()
    }, { new: true });

    if (!updatedForum) {
        return res.status(404).json({ message: "Forum not found" });
    }

    return res.status(200).json({
        message: "Forum info has been updated.",
        user: updatedForum
    });
});


/* Delete forum */
exports.forum_delete = asyncHandler(async (req, res, next) => {
    const { forumId } = req.params;

    const threads = await Thread.find({ forumPost: forumId });
    for (const thread of threads) {
        await Comment.deleteMany({ threadPost: thread._id });
        await Thread.findByIdAndDelete(thread._id);
    }

    const forum = await Forum.findByIdAndDelete({ _id: forumId })

    if (!forum) {
        return res.status(404).json({ message: "Forum not found" });
    }

    return res.status(200).json({
        message: "Forum info has been deleted.",
        forum: forum
    })
});