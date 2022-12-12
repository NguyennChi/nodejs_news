const mongoose = require('mongoose');
const databaseConfig = require(__path_configs + 'database');
const { Schema } = mongoose;

const schema = new mongoose.Schema({
    name: String, 
    slug: String,
    status: String,
    ordering: Number,
    parentId: String,
    articles: [ 
        { type: Schema.Types.ObjectId, ref: 'article' }
    ],

 },
 
 { timestamps: true }
 );

module.exports = mongoose.model(databaseConfig.col_category, schema);