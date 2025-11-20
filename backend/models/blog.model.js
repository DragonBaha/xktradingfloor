const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlogPostSchema = new Schema(
    {
        title: { type: String, required: true },
        content: String,
        author: String,
        categories: [String],
        tags: [String]
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const BlogPostModel = mongoose.model('blogpost', BlogPostSchema);
module.exports = BlogPostModel;