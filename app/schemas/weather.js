const mongoose = require('mongoose');
const { Schema } = mongoose;
const databaseConfig = require(__path_configs + 'database');

var schema = new mongoose.Schema({
    name: String,
    api: String,
    status: String,
    ordering: Number,
},
{ timestamps: true }
);

module.exports = mongoose.model(databaseConfig.col_weather, schema );




