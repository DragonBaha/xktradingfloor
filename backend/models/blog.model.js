const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlogPostSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        // slug: { type: String, unique: true, sparse: true },
        content: { type: String, required: true },
        excerpt: { type: String, maxlength: 500 },
        author: { type: Schema.Types.ObjectId, ref: 'user', required: true },
        // authorName: { type: String },
        featuredImage: { type: String },
        images: [String],
        categories: [{ type: String, trim: true }],
        tags: [{ type: String, trim: true }],
        status: {
            type: String,
            enum: ['draft', 'published', 'archived'],
            default: 'draft'
        },
        publishedAt: { type: Date },
        views: { type: Number, default: 0 },
        viewedBy: [{ 
            // Track unique viewers - can be user ID or IP address
            identifier: { type: String, required: true },
            viewedAt: { type: Date, default: Date.now }
        }],
        isFeatured: { type: Boolean, default: false },
        seoKeywords: [String],
        isDeleted: { type: Boolean, default: false }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);


const BlogPostModel = mongoose.model('blogpost', BlogPostSchema);
module.exports = BlogPostModel;