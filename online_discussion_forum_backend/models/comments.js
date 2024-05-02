const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentsSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    username: { type: String, required: true },
    profile: { type: String }, 
    forumPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Forums', required: true },
    threadPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Threads', required: true },
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comments'}],
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comments'},
    image: { type: String },
    content: { type: String },
    timestamp: { type: Date, default: Date.now},
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    edited: { type: Boolean, default: false },
    editedAt: { type: Date },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
});

module.exports = mongoose.model("Comments", commentsSchema);