const UserModel = require("../models/user.model");
const CompanyModel = require("../models/company.model");
const ReviewModel = require("../models/review.model");
const ProductModel = require("../models/product.model");
const EventModel = require("../models/event.model");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");

// Basic stats for dashboard widgets
exports.getDashboardStats = async (req, res) => {
    try {
        const [users, companies, reviews, products, events, pendingCompanies] =
            await Promise.all([
                UserModel.countDocuments({ isDeleted: false }),
                CompanyModel.countDocuments({}),
                ReviewModel.countDocuments({}),
                ProductModel.countDocuments({}),
                EventModel.countDocuments({}),
                CompanyModel.countDocuments({ status: "pending" }),
            ]);

        return sendSuccessResponse(res, {
            data: {
                users,
                companies,
                reviews,
                products,
                events,
                pendingCompanies,
            },
        });
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

// Pending approvals list (companies waiting for approval)
exports.getPendingApprovals = async (req, res) => {
    try {
        const companies = await CompanyModel.find({ status: "pending" }).sort({
            createdAt: -1,
        });
        const transformed = companies.map((c) => {
            const obj = c.toObject();
            obj.id = obj._id.toString();
            return obj;
        });
        return sendSuccessResponse(res, { data: transformed });
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};



