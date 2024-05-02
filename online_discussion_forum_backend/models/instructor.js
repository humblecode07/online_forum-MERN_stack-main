const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const instructorSchema = new Schema({
    _id: { type: mongoose.Schema.Types.ObjectId },
    school_id: { type: Number, required: true, unique: true },
    first_name: { type: String, required: true, maxLength: 100},
    family_name: { type: String, required: true, maxLength: 100},
    user_name: { type: String, required: true, maxLength: 50 },
    profile: { type: String, required: true },
    email: { type: String, required: true, unique: true, match: /^[a-zA-Z0-9._%+-]+@dyci\.edu\.ph$/ },
    pass: { type: String, required: true, minLength: 8, maxLength: 100 },
    bio: { type: String, maxLength: 100 },
    date_of_birth: { type: Date, required: true },
    sex: { type: String, required: true },
    subjects: [{ type: String, required: true }], 
    role: [{ type: String, required: true }],
    threads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Threads' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comments' }],
    upvotedThreads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Threads' }],
    downvotedThreads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Threads' }],
    reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
    refreshToken: { type: String }
});

instructorSchema.pre('save', function(next) {
    if (!this.isModified('user_name')) {
        return next();
    }

    if (!this.user_name.startsWith('@')) {
        this.user_name = `@${this.user_name}`;
    }

    next();
});

module.exports = mongoose.model("Instructors", instructorSchema)
