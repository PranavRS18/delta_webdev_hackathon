const User = require('../models/User');
const Project = require('../models/Project');
const Commit = require("../models/Commit");
const Node = require('../models/Node');

const sha1 = require('sha1');
const path = require("path");
const fs = require("fs/promises");
const pdfParse = require('pdf-parse');

// Get Projects
module.exports.getProjects = async (req, res) => {
    try {
        const {uid} = req.body
        if (!uid) return res.status(400).json({
            message: 'Invalid User ID'
        })

        const user = await User.findById(uid).lean()
        if (!user) return res.status(400).json({
            message: 'User ID does not exist'
        })

        const projects = await Project.find({
            uid: uid
        }).lean()

        return res.status(200).json({
            projects,
            message: `Successfully Retrieved  ${projects.length} Projects`
        })
    } catch (err) {
        return res.status(500).json({
            message: `Error: ${err.message}`,
        })
    }
}

// Create Project
module.exports.createProject = async (req, res) => {
    try {
        const {uid, name, description} = req.body;
        if (!uid) return res.status(400).json({
                message: 'Invalid User ID'
            })
        if (!name) return res.status(400).json({
            message: 'No Project Name Provided'
        })

        const user = await User.findById(uid).lean()
        if (!user) return res.status(400).json({
            message: 'User ID does not exist'
        })

        const project = await Project.create({
            name,
            description,
            uid,
        })

        await Node.create({
            name: 'base',
            parent_id: null,
            project_id: project._id,
            commit_id: null,
            is_folder: true,
        })

        return res.status(200).json({
            project,
            message: 'Successfully Created Project'
        })

    } catch (err) {
        return res.status(500).json({
            message: err.message,
        })
    }
}

// Get Project
module.exports.getProject = async (req, res) => {
    try {
        const {project_id} = req.body
        if (!project_id) return res.status(400).json({
            message: 'Invalid Project ID'
        })

        const project = await Project.findById(project_id)
        const node = await Node.findOne({
            project_id,
        }).lean()

        const commits = await Commit.find({
            project: project_id,
        }).populate('user').lean()

        const sorted_commits = commits.sort((commit1, commit2) => String(commit1.created_at).localeCompare(String(commit2.created_at))).reverse()
        return res.status(200).json({
            project,
            commits: sorted_commits,
            node : node,
            message: 'Successfully Retrieved Project'
        })
    } catch(err) {
        return res.status(500).json({
            message: `Error: ${err.message}`,
        })
    }
}

// Get Files
module.exports.getFiles = async (req, res) => {
    try {
        const {node} = req.body;
        if (!node) return res.status(400).json({
            message: 'Invalid Node ID'
        })

        const nodes = await Node.find({
            parent_id: node,
        }).lean()

        const sorted_nodes = nodes.sort((node1, node2) => String(node2.created_at).localeCompare(String(node1.created_at)))
        const node_names = []
        const latest_nodes = []
        sorted_nodes.forEach(node => {
            if (!node_names.includes(node.name)) {
                node_names.push(node.name)
                latest_nodes.push(node)
            }
        })

        return res.status(200).json({
            nodes: latest_nodes,
            message: `Successfully Retrieved Files`
        })
    } catch (err) {
        return res.status(500).json({
            message: `Error: ${err.message}`
        })
    }
}

// Create Folder
module.exports.createFolder = async (req, res) => {
    try {
        const {user, name, node} = req.body;
        if (!node) return res.status(400).json({
            message: 'Invalid Node ID'
        })

        const parent_node = await Node.findById(node).lean()
        if (!parent_node) return res.status(400).json({
            message: 'Given Node ID does not exist'
        })

        const commit_name = sha1(user + parent_node.project_id + Date.now())
        const folder_node = await Node.create({
            name,
            parent_id : node,
            project_id: parent_node.project_id,
            is_folder: true,
            commit_id: commit_name,
        })

        await Commit.create({
            name: commit_name,
            message: `Created ${name}`,
            user,
            project: parent_node.project_id,
            nodes: [folder_node._id]
        })

        return res.status(200).json({
            node: folder_node,
            message: 'Successfully Created Folder'
        })

    } catch (err) {
        return res.status(500).json({
            message: `Error: ${err.message}`,
        })
    }
}

// Upload Files
module.exports.updateProject = async (req, res) => {
    const {files} = req;
    const {user, project, node, commit_name, commit_msg} = req.body;
    const file_names = files.map(file => file.originalname)

    const nodes = file_names.map((file) => ({
        name: file,
        parent_id: node,
        project_id: project,
        commit_id: commit_name,
        is_folder: false
    }))
    const created_nodes = await Node.insertMany(nodes, {
        ordered: true,
        rawResult: false
    })

    const node_ids = created_nodes.map(node => node._id)
    await Commit.create({
        name: commit_name,
        message: commit_msg ? commit_msg : commit_name,
        nodes: node_ids,
        user,
        project,
    })

    return res.status(200).json({
        message: 'Project Updated'
    })
}

// Parse Files
module.exports.parseFile = async (req, res) => {
    try {
        const {node} = req.body;

        const file_path = path.resolve(__dirname, '..', '..', 'storage', node.project_id, node.parent_id, node.commit_id, node.name)
        const ext = path.extname(node.name).toLowerCase();

        let content;
        if (ext === '.pdf') content = (await pdfParse(await fs.readFile(file_path))).text
        else content = await fs.readFile(file_path, 'utf8')

        return res.status(200).json({
            content,
            message: `Successfully Parsed ${node.name}`,
        })
    } catch (err) {
        return res.status(500).json({
            message: `Error: ${err.message}`,
        })
    }
}

// Get Commit Info
module.exports.commitInfo = async (req, res) => {
    try {
        const {commit_id} = req.body;
        if (!commit_id) return res.status(400).json({
            message: 'Invalid Commit ID'
        })

        const commit = await Commit.findById(commit_id).populate('nodes').lean();

        return res.status(200).json({
            commit,
            message: 'Successfully Retrieved Commit'
        })
    } catch (err) {
        return res.status(500).json({
            message: `Error: ${err.message}`,
        })
    }
}
