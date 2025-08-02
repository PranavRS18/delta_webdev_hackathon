# D-Collab  
A Minimal, File-Centric Version Control System with Built-in Collaboration

D-Collab is a lightweight, user-friendly version control system designed for seamless team collaboration. With D-Collab, you can manage your projects, upload and organize files with hierarchical folder structures, and track every change made, all in one place.

## Features

### User Authentication
- Secure login system using JWT
- Users can own their projects and restrict access to themselves

### Project & File Management
- Create multiple projects tied to your account
- Upload files in bulk with automatic sorting
- Folder hierarchy support for organized structure

### Smart Upload Handling
- If a file with the same name already exists, D-Collab keeps the most recent version
- Older versions remain accessible via the commit history

### In-App File Viewing
- Instantly view text and PDF files in the browser without downloading

### Commit History & Diff Tracking
- View all commits made to your project, including:
  - Who made the commit
  - When the commit was made (timestamp)
- Explore files from older commits and track where changes were made

## Tech Stack

- Frontend: Vue, HTML, CSS  
- Backend: Node.js, Express  
- Database: MongoDB  
- Authentication: JWT

## License

MIT © 2025
