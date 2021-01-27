const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const Post = require('../models/post');
const User = require('../models/user');

const ITEMS_PER_PG = 2;

exports.getPosts = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalPosts;
    Post.count().then(count => {
        totalPosts = count;
        return Post.findAll({
            offset: (page - 1) * ITEMS_PER_PG,
            limit: ITEMS_PER_PG
        });
    }).then(posts => {
        res.status(200).json({
            message: 'Posts Fetched!',
            posts: posts,
            totalPosts: totalPosts
        });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Invalid Input data! Plz correct it!');
        error.statusCode = 422;
        throw error;//Sync Code => hence can throw err! It's caught by the catch block which then uses next(err) to make it into the error handling middleware!
        // return res.status(422).json({
        //     message: 'Input Validation failed! Data is incorrect',
        //     errors: errors.array()
        // });
    }
    if (!req.file) {
        const error = new Error('No Image Provided!');
        error.statusCode = 422;
        throw error;
    }
    const imageUrl = req.file.path;
    const title = req.body.title;
    const content = req.body.content;
    req.user.createPost({
        title: title,
        content: content,
        imageUrl: imageUrl
    }).then(post => {
        res.status(201).json({
            message: 'Post created successfully!',
            post: post,
            creator: { id: req.userId, name: req.user.name }
        });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);//Async code/chain => use next(<err>) to reach the error handling middleware!
    });
};

exports.getPost = (req, res, next) => {
    const postId = +req.params.postId;
    Post.findByPk(postId).then(post => {
        if (!post) {
            const error = new Error('Could not find post!');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            message: 'Post fetched successfully!',
            post: post
        });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => {
        throw (err);
    });
};

exports.editPost = (req, res, next) => {
    const postId = +req.params.postId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Invalid Input data! Plz correct it!');
        error.statusCode = 422;
        throw error;//Sync Code => hence can throw err! It's caught by the catch block which then uses next(err) to make it into the error handling middleware!
    }
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    if (req.file) {
        imageUrl = req.file.path;
    }
    if (!imageUrl) {
        const error = new Error('No file Picked!');
        error.statusCode = 422;
        throw error;
    }
    req.user.getPosts({
        where: {
            id: {
                [Op.eq]: postId
            }
        }
    }).then(([post]) => {
        if (!post) {
            const error = new Error('Not Authorized to edit other users posts!');
            error.statusCode = 403;//Not authorized
            throw error;
        }
        if (imageUrl !== post.imageUrl) {
            clearImage(post.imageUrl);
        }
        post.title = title;
        post.imageUrl = imageUrl;
        post.content = content;
        return post.save();
    }).then(post => {
        res.status(200).json({
            message: 'Post updated!',
            post: post
        });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.deletePost = (req, res, next) => {
    const postId = +req.params.postId;
    req.user.getPosts({
        where: {
            id: {
                [Op.eq]: postId
            }
        }
    }).then(([post]) => {
        if (!post) {
            const error = new Error('Not Authorized!');
            error.statusCode = 403;
            throw error;
        }
        clearImage(post.imageUrl);
        return post.destroy();
    }).then(result => {
        console.log(result);
        res.status(200).json({
            message: 'Post deleted!'
        });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
}


