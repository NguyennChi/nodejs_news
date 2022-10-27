const mongoose = require('mongoose');
const databaseConfig = require(__path_configs + 'database');

var schema = new mongoose.Schema({ 
    username: String, 
    password: String,
    level: Number,
    status: String
});

module.exports = mongoose.model(databaseConfig.col_users, schema );