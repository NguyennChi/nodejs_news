const mongoose = require('mongoose');
const databaseConfig = require(__path_configs + 'database');

var schema = new mongoose.Schema({ 
    name: String, 
    slug: String, 
    status: String,
    avatar: String,
    ordering: Number,
    // created: {
    //     userId: Number,
    //     username: String,
    //     time: Date
    // },
    // modified: {
    //     userId: Number,
    //     username: String,
    //     time: Date
    // },
    description: String,
},{ timestamps: true });

module.exports = mongoose.model(databaseConfig.col_sliders, schema );