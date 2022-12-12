const mongoose = require('mongoose');
const databaseConfig = require(__path_configs + 'database');


const schema = new mongoose.Schema({
    name: String, 
    slug: String,
    status: String,
    ordering: Number,
    parentmenu: String,
 },
 { timestamps: true }
 );

module.exports = mongoose.model(databaseConfig.col_menu, schema);
