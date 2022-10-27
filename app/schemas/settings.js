const mongoose = require('mongoose');
const databaseConfig = require(__path_configs + 'database');

var schema = new mongoose.Schema({ 
    footer: String, 
    header: String, 
},{ timestamps: true });

module.exports = mongoose.model(databaseConfig.col_settings, schema );