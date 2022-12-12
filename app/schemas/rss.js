const mongoose = require('mongoose');
const databaseConfig = require(__path_configs + 'database');

var schema = new mongoose.Schema({
    name: String, 
    slug: String,
    status: String,
    ordering: Number,
    link: String,
    source: String
},
{ timestamps: true }
);

module.exports = mongoose.model(databaseConfig.col_rss, schema );




