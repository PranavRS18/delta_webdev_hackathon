const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NodeSchema = new Schema({
    name: {
        type: String,
    },
    parent_id: {
        type: Schema.Types.ObjectId,
        ref: 'Node',
    },
    project_id: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
    },
    commit_id: {
        type: String,
        ref: 'Commit',
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    is_folder: {
      type: Boolean,
      required: true,
    },
    is_deleted: {
        type: Boolean,
        default: false,
    }
})
NodeSchema.index({
    parent_id: 1,
    project_id: 1,
    commit_id: 1,
})

const Node = mongoose.model('Node', NodeSchema, 'nodes');
module.exports = Node;