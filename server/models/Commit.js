const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommitSchema = new Schema({
    name : {
        type: String,
        required: true
    },
    message : {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    project : {
        type: Schema.Types.ObjectId,
        ref: 'Project'
    },
    nodes: {
        type: Array,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now()
    }
})

CommitSchema.index({ user : 1, project : 1 })

const Commit = mongoose.model('Commit', CommitSchema, 'commits')
module.exports = Commit;