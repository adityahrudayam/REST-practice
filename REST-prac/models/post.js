const { DataTypes } = require('sequelize');

const sequelize = require('../util/database');

const Post = sequelize.define('post', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING
    },
    imageUrl: DataTypes.STRING(1234),
    content: DataTypes.TEXT
});

module.exports = Post;