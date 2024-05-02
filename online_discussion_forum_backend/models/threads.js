const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const threadsSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    username: { type: String, required: true },
    profile: { type: String }, 
    forumPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Forums', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: [{ type: String, required: true }],
    timestamp: { type: Date, default: Date.now},
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
    downvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
    viewCount: { type: Number, default: 0 },
    viewBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
    commentCount: { type: Number, default: 0 },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comments' }],
    edited: { type: Boolean, default: false },
    editedAt: { type: Date },
    deletedAt: { type: Date },
    pinned: { type: Boolean, default: false }
});

module.exports = mongoose.model("Threads", threadsSchema);