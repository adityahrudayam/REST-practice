const Sequelize = require('sequelize');

const sequelize = new Sequelize('post-db', 'root', 'Hello-DB', {
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;