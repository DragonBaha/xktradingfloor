const ProductModel = require("../models/product.model");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");
const { getPagination, getPaginationData, escapeRegex } = require("../utils/fn");

// Create product
exports.createProduct = async (req, res) => {
    try {
        const product = new ProductModel(req.body);
        const saved = await product.save();
        const p = saved.toObject();
        p.id = p._id.toString();
        return sendSuccessResponse(res, { message: "Product created", data: p }, 201);
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const { search, page, size } = req.query;
        const { limit, offset } = getPagination(page, size);
        const searchTerm = escapeRegex(search);

        const query = {};
        if (searchTerm) {
            query.$or = [
                { title: { $regex: searchTerm, $options: "i" } },
                { description: { $regex: searchTerm, $options: "i" } },
            ];
        }

        const products = await ProductModel.find(query)
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit);
        const totalItems = await ProductModel.countDocuments(query);

        const transformed = products.map((product) => {
            const p = product.toObject();
            p.id = p._id.toString();
            return p;
        });

        return sendSuccessResponse(
            res,
            getPaginationData({ count: totalItems, docs: transformed }, page, limit)
        );
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

// Get product by ID
exports.getProductById = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await ProductModel.findById(productId);
        if (!product) {
            return sendErrorResponse(res, "Product not found", 404, true, true);
        }
        const p = product.toObject();
        p.id = p._id.toString();
        return sendSuccessResponse(res, { data: p });
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await ProductModel.findById(productId);
        if (!product) {
            return sendErrorResponse(res, "Product not found", 404, true, true);
        }
        Object.assign(product, req.body);
        const updated = await product.save();
        const p = updated.toObject();
        p.id = p._id.toString();
        return sendSuccessResponse(res, { message: "Product updated", data: p });
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

// Update stock only
exports.updateStock = async (req, res) => {
    try {
        const { productId } = req.params;
        const { stock } = req.body;
        const product = await ProductModel.findById(productId);
        if (!product) {
            return sendErrorResponse(res, "Product not found", 404, true, true);
        }
        product.stock = stock;
        const updated = await product.save();
        const p = updated.toObject();
        p.id = p._id.toString();
        return sendSuccessResponse(res, { message: "Stock updated", data: p });
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await ProductModel.findByIdAndDelete(productId);
        if (!product) {
            return sendErrorResponse(res, "Product not found", 404, true, true);
        }
        return sendSuccessResponse(res, { message: "Product deleted" });
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};



