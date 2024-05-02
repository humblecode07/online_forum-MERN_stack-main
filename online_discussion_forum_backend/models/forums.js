const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const forumsSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    name: { type: String, required: true },
    creator: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    type: { type: String },
    creationTime: { type: Date, default: Date.now },
    threads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Threads' }],
    editedAt: { type: Date },
    deletedAt: { type: Date },
});

module.exports = mongoose.model("Forums", forumsSchema)