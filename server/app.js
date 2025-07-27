const express = require('express')
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const AuthRoutes = require('./routes/auth_routes');
const ProjectRoutes = require('./routes/project_routes');
require('dotenv').config();

const app = express();
app.use(cors({
    origin: process.env.CLIENT,
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Connect with MongoDB
dbURI = process.env.MONGODB_URI
mongoose.connect(dbURI)
    .then(() => {
        console.log('Connected to DB');
        app.listen(process.env.PORT || 5000, () => {
            console.log(`Server running on port ${process.env.PORT || 5000}`);
        })
    })
    .catch((err) => {
        console.log(`Failed to connect to the Database -> ${err}`);
    })

app.get('/', (req, res) => {
    res.status(200).send('Welcome to the Server!');
})

app.use(AuthRoutes)
app.use(ProjectRoutes)