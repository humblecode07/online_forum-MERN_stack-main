const Instructor = require('../models/instructor');
const User = require('../models/users');
const Forum = require('../models/forums');
const Thread = require('../models/threads');
const Comment = require('../models/comments');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');
const { gridFSBucket } = global;
const fs = require('fs')
const { v4: uuidv4 } = require('uuid');

exports.instructor_get = asyncHandler(async (req, res, next) => {
    const [instructors, instructorCount] = await Promise.all([
        Instructor.find().exec(),
        Instructor.countDocuments().exec()
    ]);

    return res.status(201).json({
        instructorCount,
        instructors
    });
});

exports.instructor_get_one = asyncHandler(async (req, res, next) => {
    const { instructorId } = req.params;
    const instructor = await Instructor.find({ _id: instructorId })
        .populate({
            path: 'threads',
            populate: {
                path: 'comments',
            }
        })
        .populate({
            path: 'comments',
            populate: [
                {
                    path: 'forumPost',
                },
                {
                    path: 'threadPost'
                }
            ]
        })
        .populate('upvotedThreads')
        .populate('downvotedThreads')
        .populate('students')
        .exec();

    if (!instructor) {
        return res.status(404).json({ message: "Instructor not found" });
    }

    return res.status(201).json({
        instructor: instructor
    });
});

exports.instructor_post_create = asyncHandler(async (req, res, next) => {
    const existingInstructor = await Instructor.findOne({ email: req.body.email });
    if (existingInstructor) {
        return res.status(409).json({
            message: 'E-mail already exists'
        });
    }

    try {
        const hash = await bcrypt.hash(req.body.pass, 10);

        // Extract file extension from the original filename
        const originalFilename = req.file.originalname;
        const fileExtension = originalFilename.split('.').pop();

        // Generate a unique filename for the profile image
        const profileImageUUID = uuidv4() + '.' + fileExtension;

        const readStream = fs.createReadStream(req.file.path);

        // Use GridFSBucket to store the file in MongoDB
        const uploadStream = global.gridFSBucket.openUploadStream(profileImageUUID);

        // Pipe the file stream to GridFS upload stream
        readStream.pipe(uploadStream);

        uploadStream.on('error', (error) => {
            console.error('Error uploading file:', error);
            res.status(500).json({ message: "Failed to upload file" });
        });

        uploadStream.on('finish', async () => {
            const instructor = new Instructor({
                _id: new mongoose.Types.ObjectId(),
                school_id: req.body.school_id,
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                user_name: req.body.user_name,
                profile: profileImageUUID,
                email: req.body.email,
                pass: hash,
                bio: req.body.bio,
                date_of_birth: req.body.date_of_birth,
                sex: req.body.sex,
                subjects: req.body.subjects,
                role: req.body.role instanceof Array ? req.body.role : [req.body.role]
            });

            const savedInstructor = await instructor.save();
            console.log(savedInstructor);
            return res.status(201).json({
                message: "Instructor created"
            });
        });

        readStream.on('error', (error) => {
            console.error('Error reading file:', error);
            res.status(500).json({ message: "Failed to read file" });
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
});


exports.instructor_post_changepass = asyncHandler(async (req, res, next) => {
    const { instructorId } = req.params;
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt)
    const updatedPass = await Instructor.findByIdAndUpdate({ _id: instructorId }, { pass: hashPassword }, { new: true })

    if (!updatedPass) {
        return res.status(404).json({ message: "Instructor not found" });
    }

    return res.status(200).json({
        message: "Password changed successfully"
    })
});

exports.instructor_patch_info = asyncHandler(async (req, res, next) => {
    const { instructorId } = req.params;
    const profileImage = req.file.path;

    const userDataToUpdate = { ...req.body };
    delete userDataToUpdate.profileImage;

    userDataToUpdate.profile = profileImage;

    const updatedInstructor = await Instructor.findByIdAndUpdate(instructorId, { $set: userDataToUpdate }, { new: true });

    if (!updatedInstructor) {
        return res.status(404).json({ message: "Instructor not found" });
    }

    return res.status(200).json({
        message: "Instructor info has been updated.",
        instructor: updatedInstructor
    });
});

exports.instructor_delete = asyncHandler(async (req, res, next) => {
    const { instructorId } = req.params;

    const forums = await Forum.find({ user: instructorId });
    for (const forum of forums) {
        await Thread.deleteMany({ forumPost: forum._id });
        await Forum.findByIdAndDelete(forum._id);
    }

    await Comment.deleteMany({ user: instructorId });

    const deletedInstructor = await Instructor.findByIdAndDelete(instructorId);

    if (!deletedInstructor) {
        return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
        message: "Instructor info and associated data have been deleted.",
        user: deletedInstructor
    });
});