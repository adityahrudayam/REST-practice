const { DataTypes } = require('sequelize');
const sequelize = require('../util/database');

const User = sequelize.define('user', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    name: DataTypes.STRING,
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Hello there!'
    }
}, {
    timestamps: false,
    createdAt: false,
    updatedAt: false
});

module.exports = User;