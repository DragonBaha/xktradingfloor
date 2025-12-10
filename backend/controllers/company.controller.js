const CompanyModel = require("../models/company.model");
const ReviewModel = require("../models/review.model");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");
const { getPagination, getPaginationData, escapeRegex } = require("../utils/fn");
const constants = require("../utils/constants");
const r2 = require("../helpers/r2.helper");

// Helper function to recalculate company rating
async function recalculateCompanyRating(companyId) {
    const reviews = await ReviewModel.find({ companyId });
    if (reviews.length === 0) {
        return { ratingsAggregate: 0, totalReviews: 0 };
    }
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const ratingsAggregate = totalRating / reviews.length;
    return { ratingsAggregate: parseFloat(ratingsAggregate.toFixed(1)), totalReviews: reviews.length };
}

exports.getAllApprovedCompanies = async (req, res) => {
    try {
        const { search, page, size } = req.query;
        const { limit, offset } = getPagination(page, size);
        const searchTerm = escapeRegex(search);
        const { category = "" } = req.body;

        const query = {};

        if (category != "") query.category = category;
        query.status = 'approved';

        if (searchTerm) {
            query.$or = [
                { name: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { details: { $regex: searchTerm, $options: 'i' } }
            ];
        }

        const companies = await CompanyModel.find(query)
            .populate('addedBy', 'fullName email profileImage')
            .populate('adminId', 'fullName email profileImage')
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .lean();

        const totalItems = await CompanyModel.countDocuments(query);

        const reviews = await ReviewModel.find({
            companyId: { $in: companies.map(c => c._id) }
        }).populate("userId").lean();

        const reviewsByCompany = reviews.reduce((acc, review) => {
            if (!acc[review.companyId]) {
                acc[review.companyId] = [];
            }
            acc[review.companyId].push(review);
            return acc;
        }, {});

        const companiesWithRatings = companies.map(company => {
            const companyReviews = reviewsByCompany[company._id] || [];
            const reviewers = companyReviews.map(r => r.userId);
            const totalReviews = companyReviews.length;
            const ratingsAggregate = totalReviews > 0
                ? parseFloat((companyReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
                : 0;
            return {
                ...company,
                reviewers,
                ratingsAggregate,
                totalReviews
            };
        })

        return sendSuccessResponse(res, getPaginationData(
            { count: totalItems, docs: companiesWithRatings },
            page,
            limit
        ));
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

// Get all companies (with optional filters)
exports.getAllCompanies = async (req, res) => {
    try {
        const { search, page, size } = req.query;
        const { category, status, minRating } = req.body;
        const { limit, offset } = getPagination(page, size);
        const searchTerm = escapeRegex(search);

        const query = {};

        if (category) query.category = category;
        if (status) query.status = status;
        if (searchTerm) {
            query.$or = [
                { name: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { details: { $regex: searchTerm, $options: 'i' } }
            ];
        }

        const companies = await CompanyModel.find(query)
            .populate('addedBy', 'fullName email profileImage')
            .populate('adminId', 'fullName email profileImage')
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .lean();

        const totalItems = await CompanyModel.countDocuments(query);

        const reviews = await ReviewModel.find({
            companyId: { $in: companies.map(c => c._id) }
        }).populate("userId").lean();

        const reviewsByCompany = reviews.reduce((acc, review) => {
            if (!acc[review.companyId]) {
                acc[review.companyId] = [];
            }
            acc[review.companyId].push(review);
            return acc;
        }, {});

        const companiesWithRatings = companies.map(company => {
            const companyReviews = reviewsByCompany[company._id] || [];
            // const reviewers = companyReviews.map(r => r.userId);
            const totalReviews = companyReviews.length;
            const ratingsAggregate = totalReviews > 0
                ? parseFloat((companyReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
                : 0;
            return {
                ...company,
                // reviewers,
                ratingsAggregate,
                totalReviews
            };
        })

        return sendSuccessResponse(res, getPaginationData(
            { count: totalItems, docs: companiesWithRatings },
            page,
            limit
        ));
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

// Get company by ID
exports.getCompanyById = async (req, res) => {
    try {
        const { companyId } = req.params;
        const company = await CompanyModel.findById(companyId)
            .populate('addedBy', 'fullName email profileImage')
            .populate('adminId', 'fullName email profileImage')
            .lean();

        if (!company) {
            return sendErrorResponse(res, "Company not found", 404, true, true);
        }

        const reviews = await ReviewModel.find({ companyId: company._id }).populate("userId").lean();
        const reviewers = reviews.map(r => r.userId);
        const totalReviews = reviews.length;
        const ratingsAggregate = totalReviews > 0
            ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
            : 0;

        reviews.ratingsAggregate = ratingsAggregate;
        reviews.totalReviews = totalReviews;

        company.reviewsDetails = reviews;

        return sendSuccessResponse(res, { data: company });
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

// Create company (permission checked in middleware)
exports.createCompany = async (req, res) => {
    try {
        const { _id: userId, role } = req.user;

        let logo = "";
        if (req.files && req.files.logo) {
            logo = req.files.logo[0];
            const pathN = logo.path.replace(/\\/g, "/");
            logo.path = pathN;

            const url = await r2.uploadPublic(logo.path, `${logo.filename}`, "Companies");
            logo = url;
        };

        const companyData = {
            ...req.body,
            addedBy: userId,
            adminId: role === constants.roles.admin ? userId : undefined,
            status: role === constants.roles.admin ? 'approved' : 'pending',
            ratingsAggregate: 0,
            totalReviews: 0,
            logo: logo,
            promoCodes: req.body.promoCodes || []
        };

        const company = new CompanyModel(companyData);
        const savedCompany = await company.save();

        // Populate user references
        await savedCompany.populate('addedBy', 'fullName email profileImage');
        if (savedCompany.adminId) {
            await savedCompany.populate('adminId', 'fullName email profileImage');
        }

        const companyObj = savedCompany.toObject();
        companyObj.id = companyObj._id.toString();
        return sendSuccessResponse(res, {
            message: "Company created successfully",
            data: companyObj
        }, 201);
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

// Update company (permission checked in middleware, operators can only update their own)
exports.updateCompany = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { _id: userId, role } = req.user;

        const company = await CompanyModel.findById(companyId);
        if (!company) {
            return sendErrorResponse(res, "Company not found", 404, true, true);
        }

        // Operators can only update their own companies (ownership check)
        if (role === constants.roles.operator && company.admminId.toString() !== userId.toString()) {
            return sendErrorResponse(res, "You can only update your own companies", 403, true, true);
        }

        // If rating fields are being updated, recalculate
        if (req.body.ratingsAggregate !== undefined || req.body.totalReviews !== undefined) {
            const ratingData = await recalculateCompanyRating(companyId);
            req.body.ratingsAggregate = ratingData.ratingsAggregate;
            req.body.totalReviews = ratingData.totalReviews;
        }

        Object.assign(company, req.body);
        const updatedCompany = await company.save();

        // Populate user references
        await updatedCompany.populate('addedBy', 'fullName email profileImage');
        if (updatedCompany.adminId) {
            await updatedCompany.populate('adminId', 'fullName email profileImage');
        }

        const companyObj = updatedCompany.toObject();
        companyObj.id = companyObj._id.toString();
        return sendSuccessResponse(res, {
            message: "Company updated successfully",
            data: companyObj
        });
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

// Delete company (permission checked in middleware, operators can only delete their own)
exports.deleteCompany = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { _id: userId, role } = req.user;

        const company = await CompanyModel.findById(companyId);
        if (!company) {
            return sendErrorResponse(res, "Company not found", 404, true, true);
        }

        // Operators can only delete their own companies (ownership check)
        if (role === constants.roles.operator && company.adminId.toString() !== userId.toString()) {
            return sendErrorResponse(res, "You can only delete your own companies", 403, true, true);
        }

        await CompanyModel.findByIdAndDelete(companyId);
        return sendSuccessResponse(res, {
            message: "Company deleted successfully"
        });
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

// Add promo code to company (permission checked in middleware, operators can only add to their own)
exports.addPromoCode = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { _id: userId, role } = req.user;

        const company = await CompanyModel.findById(companyId);
        if (!company) {
            return sendErrorResponse(res, "Company not found", 404, true, true);
        }

        // Operators can only add promo codes to their own companies (ownership check)
        if (role === constants.roles.operator && company.adminId.toString() !== userId.toString()) {
            return sendErrorResponse(res, "You can only add promo codes to your own companies", 403, true, true);
        }

        const newPromo = {
            id: `promo-${Date.now()}`,
            ...req.body,
            createdAt: new Date()
        };

        if (!company.promoCodes) {
            company.promoCodes = [];
        }
        company.promoCodes.push(newPromo);
        await company.save();

        return sendSuccessResponse(res, {
            message: "Promo code added successfully",
            data: newPromo
        });
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

// Update promo code (permission checked in middleware, operators can only update their own)
exports.updatePromoCode = async (req, res) => {
    try {
        const { companyId, promoId } = req.params;
        const { _id: userId, role } = req.user;

        const company = await CompanyModel.findById(companyId);
        if (!company) {
            return sendErrorResponse(res, "Company not found", 404, true, true);
        }

        // Operators can only update promo codes for their own companies (ownership check)
        if (role === constants.roles.operator && company.adminId.toString() !== userId.toString()) {
            return sendErrorResponse(res, "You can only update promo codes for your own companies", 403, true, true);
        }

        const promoIndex = company.promoCodes.findIndex(p => p.id === promoId || p._id?.toString() === promoId);
        if (promoIndex === -1) {
            return sendErrorResponse(res, "Promo code not found", 404, true, true);
        }

        company.promoCodes[promoIndex] = {
            ...company.promoCodes[promoIndex].toObject(),
            ...req.body
        };
        await company.save();

        return sendSuccessResponse(res, {
            message: "Promo code updated successfully",
            data: company.promoCodes[promoIndex]
        });
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

// Delete promo code (permission checked in middleware, operators can only delete their own)
exports.deletePromoCode = async (req, res) => {
    try {
        const { companyId, promoId } = req.params;
        const { _id: userId, role } = req.user;

        const company = await CompanyModel.findById(companyId);
        if (!company) {
            return sendErrorResponse(res, "Company not found", 404, true, true);
        }

        // Operators can only delete promo codes from their own companies (ownership check)
        if (role === constants.roles.operator && company.adminId.toString() !== userId.toString()) {
            return sendErrorResponse(res, "You can only delete promo codes from your own companies", 403, true, true);
        }

        company.promoCodes = company.promoCodes.filter(
            p => p.id !== promoId && p._id?.toString() !== promoId
        );
        await company.save();

        return sendSuccessResponse(res, {
            message: "Promo code deleted successfully"
        });
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

// Request company addition (user must be logged in, authentication required)
exports.requestCompanyAddition = async (req, res) => {
    try {
        const { _id: userId } = req.user;

        let logo = "";
        if (req.files && req.files.logo) {
            logo = req.files.logo[0];
            const pathN = logo.path.replace(/\\/g, "/");
            logo.path = pathN;

            const url = await r2.uploadPublic(logo.path, `${logo.filename}`, "CompanyRequests");
            logo = url;
        }

        const companyData = {
            ...req.body,
            addedBy: userId,
            status: 'pending',
            ratingsAggregate: 0,
            totalReviews: 0,
            logo: logo,
            promoCodes: req.body.promoCodes || []
        };

        const company = new CompanyModel(companyData);
        const savedCompany = await company.save();

        await savedCompany.populate('addedBy', 'fullName email profileImage');

        const companyObj = savedCompany.toObject();
        companyObj.id = companyObj._id.toString();
        return sendSuccessResponse(res, {
            message: "Company addition request submitted successfully. It will be reviewed by an admin or operator.",
            data: companyObj
        }, 201);
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};