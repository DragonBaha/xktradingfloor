const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema(
    {
        title: { type: String, required: true },
        name: { type: String }, // Alias
        description: String,
        price: { type: Number, required: true },
        stock: { type: Number, default: 0 },
        images: [String], // Array of image URLs
        image: String, // Single image (legacy)
        sku: String, // Stock keeping unit
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const ProductModel = mongoose.model('product', ProductSchema);
module.exports = ProductModel;