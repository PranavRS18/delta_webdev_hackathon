const express = require('express');
const controllers = require('../controllers/project_controllers.js');
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Find User Projects
router.post('/api/project/user', controllers.getProjects)

// Create Project
router.post('/api/project/create', controllers.createProject)

// Get Project
router.post('/api/project/get', controllers.getProject)

// Get Files
router.post('/api/project/files', controllers.getFiles)

// Create Folder
router.post('/api/project/folder', controllers.createFolder)

// Parse File
router.post('/api/project/parse', controllers.parseFile)

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const base = '../storage';
        const {project, node, commit_name} = req.body

        const commit_base = path.join(base, project, node, commit_name);
        if (!fs.existsSync(commit_base)) fs.mkdirSync(commit_base, { recursive: true });

        cb(null, commit_base);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 128
    }
});

// Upload Files to Project
router.post('/api/project/upload', upload.array('files'), controllers.updateProject)

// Get Commit Files
router.post('/api/project/commit', controllers.commitInfo)

module.exports = router;