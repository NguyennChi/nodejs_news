const mongoose = require('mongoose');
const databaseConfig = require(__path_configs + 'database');

var schema = new mongoose.Schema({ 
    name: String, 
    slug: String, 
    status: String,
    ordering: Number,
    parentId: String,
    articles: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: databaseConfig.col_articles
    }],
},{ timestamps: true });

module.exports = mongoose.model(databaseConfig.col_categories, schema );