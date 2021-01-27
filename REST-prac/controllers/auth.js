const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Input Validation Failed!');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    bcrypt.hash(password, 12).then(hashPassword => {
        return User.create({
            email: email,
            name: name,
            password: hashPassword
        });
    }).then(user => {
        res.status(201).json({
            message: 'User created successfully!',
            userId: user.id
        });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let currentUser;
    User.findOne({
        where: {
            email: {
                [Op.eq]: email
            }
        }
    }).then(user => {
        if (!user) {
            const error = new Error('No user found!');
            error.statusCode = 401;
            throw error;
        }
        currentUser = user;
        return bcrypt.compare(password, user.password);
    }).then(isEqual => {
        if (!isEqual) {
            const error = new Error('Incorrect Password!');
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign({
            email: currentUser.email,
            userId: currentUser.id
        }, 'longpasswordstringinprodforsecurity', { expiresIn: '1h' });
        res.status(200).json({
            token: token,
            userId: currentUser.id
        });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.getUserStatus = (req, res, next) => {
    res.status(200).json({
        status: req.user.status
    });
};

exports.editUserStatus = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Input Validation Failed!');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const newStatus = req.body.status;
    req.user.status = newStatus;
    req.user.save().then(user => {
        res.status(200).json({
            message: 'Status Updated!'
        });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};