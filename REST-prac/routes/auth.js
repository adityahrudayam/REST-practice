const express = require('express');
const { body } = require('express-validator');
const { Op } = require('sequelize');

const User = require('../models/user');
const isAuth = require('../middleware/isAuth');

const authController = require('../controllers/auth');

const router = express.Router();

router.put('/signup', [//put/post
    body('email')
        .isEmail()
        .withMessage('Please Enter a valid Email!')
        .custom((value, { req }) => {
            return User.findOne({
                where: {
                    email: {
                        [Op.eq]: value
                    }
                }
            }).then(user => {
                if (user) {
                    return Promise.reject('Email already exists! ');
                }
            }).catch(err => {
                if (!err.statusCode) {
                    err.statusCode = 500;
                }
                next(err);
            });
        }).normalizeEmail(),
    body('password')
        .trim()
        .isLength({ min: 5 }),
    body('name')
        .trim()
        .notEmpty()
], authController.signup);

router.post('/login', authController.login);

router.get('/status', isAuth, authController.getUserStatus);

router.patch('/status', isAuth, [
    body('status')
        .trim()
        .notEmpty()
], authController.editUserStatus);   //The HTTP PATCH request method applies partial modifications to a resource.just like PUT it can edit

module.exports = router;