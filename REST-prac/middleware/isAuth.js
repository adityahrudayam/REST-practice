const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const error = new Error('Not Authenticated');
        error.statusCode = 401;
        throw error;
    }
    const token = authHeader.split(' ')[1];//get() method - getting the Authorization Header!
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'longpasswordstringinprodforsecurityofsignature');//both decodes and verifies the token! Using .decode() only decodes the token!
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }
    if (!decodedToken) {
        const error = new Error('Not Authenticated!');
        error.statusCode = 401;
        throw error;
    }
    req.userId = decodedToken.userId;
    User.findByPk(req.userId).then(user => {
        if (!user) {
            const error = new Error('User not found sorry!');
            error.statusCode = 401;
            throw error;
        }
        req.user = user;
        next();
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};