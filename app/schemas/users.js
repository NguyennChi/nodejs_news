const mongoose = require('mongoose');
const databaseConfig = require(__path_configs + 'database');
const { Schema } = mongoose;

const schema = new mongoose.Schema({
    name: String,
    slug: String,
    status: String,
    ordering: Number,
    editordata: String,
    group_id: String,
    // group: { type: Schema.Types.ObjectId, ref: 'group' },
    group: { 
        id: String, 
        name: String
    },
    thumb: String,
 },
 { timestamps: true }
 );

module.exports = mongoose.model(databaseConfig.col_users, schema);
