const mongoose = require('mongoose');
const databaseConfig = require(__path_configs + 'database');
const { Schema } = mongoose;

const schema = new mongoose.Schema({
    name: String, 
    slug: String,
    status: String,
    ordering: Number,
    thumb: String,
    slider: {
        type: Boolean,
        default: false
    },
    toppost: {
        type: Boolean,
        default: false
    },
    breakingnews: {
        type: Boolean,
        default: false
    },
    fearture: {
        type: Boolean,
        default: false
    },
    editordata: String,
    categoryId: String,
    category: { type: Schema.Types.ObjectId, ref: 'category' },
},
{ timestamps: true }
);

module.exports = mongoose.model(databaseConfig.col_article, schema);
