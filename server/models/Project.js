const mongoose = require('mongoose');
const Schema = mongoose.Schema

const ProjectSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    uid: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
})
ProjectSchema.index({ uid : 1})

const Project = mongoose.model('Project', ProjectSchema, 'projects');
module.exports = Project;