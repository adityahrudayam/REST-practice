const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

const Post = require('./models/post');
const User = require('./models/user');

const sequelize = require('./util/database');
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now().toString() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);//valid file!
    } else {
        cb(null, false);
    }
};

// app.use(bodyParser.urlencoded({ extended: false })); //for x-www-form-urlencoded <form> input post requests
app.use(bodyParser.json()); // for application/json requests!
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => { //CORS Headers!
    res.setHeader('Allow-Control-Allow-Origin', '*');
    res.setHeader('Allow-Control-Allow-Methods', 'OPTIONS,POST,GET,PUT,PATCH,DELETE');
    res.setHeader('Allow-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((err, req, res, next) => {//Error handling middleware to catch all errors!
    console.log(err);
    const status = err.statusCode || 500;
    const message = err.message;
    const data = err.data;
    res.status(status).json({
        message: message,
        data: data
    });
});

User.hasMany(Post, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Post.belongsTo(User);

sequelize.sync().then(res => {
    app.listen(8000);
}).catch(err => console.log(err));