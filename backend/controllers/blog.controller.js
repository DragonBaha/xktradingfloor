const BlogModel = require("../models/blog.model");
const UserModel = require("../models/user.model");
const dayjs = require("dayjs");
const crypto = require("crypto");
const r2 = require("../helpers/r2.helper");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");
const { getPagination, getPaginationData, escapeRegex } = require("../utils/fn");

// Helper function to get unique viewer identifier
const getViewerIdentifier = (req) => {
    // If user is logged in, use their user ID
    if (req.user && req.user._id) {
        return `user_${req.user._id}`;
    }
    // Otherwise, use IP address + User-Agent for anonymous users
    const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    // Create a hash-like identifier from IP and User-Agent
    const identifier = crypto.createHash('md5').update(`${ip}_${userAgent}`).digest('hex');
    return `anon_${identifier}`;
};

// Admin: Create blog post
exports.createBlog = async (req, res) => {
    try {
        const { _id: adminId, role } = req.user;

        let featuredImage = "";
        if (req?.files?.featuredImage) {
            featuredImage = req.files.featuredImage[0];
            const pathN = featuredImage?.path;
            const npathN = pathN.replaceAll("\\", "/");
            featuredImage.path = npathN;

            // Upload to Cloudflare R2
            const url = await r2.uploadPublic(featuredImage?.path, `${featuredImage?.filename}`, `Blogs`);
            featuredImage = url;
        }

        const blogData = req.body;
        blogData.author = adminId || null;
        blogData.featuredImage = featuredImage || null;

        if (blogData.status === 'published' && role != "User") {
            blogData.publishedAt = new Date();
        }

        const blog = new BlogModel(blogData);
        const savedBlog = await blog.save();

        return sendSuccessResponse(res, {
            message: "Blog post created successfully",
            data: savedBlog
        }, 201);
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

// Admin: Get all blogs (with filters)
exports.getAllBlogs = async (req, res) => {
    try {
        const { _id: adminId, role } = req.user;
        let { page, size, search } = req.query;

        const { status } = req.body;

        const { limit, offset } = getPagination(page, size);
        search = escapeRegex(search);

        const query = {};

        if (role !== "Admin") {
            query.author = adminId;
        }

        if (status) {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        const blogs = await BlogModel.find(query)
            .populate('author', 'fullName email profileImage')
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit);

        const totalItems = await BlogModel.countDocuments(query);

        return sendSuccessResponse(res,
            getPaginationData({ count: totalItems, docs: blogs }, page, limit)
        );

    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

// Admin/Public: Get single blog by ID
exports.getBlogById = async (req, res) => {
    try {
        const { blogid } = req.params;
        const blog = await BlogModel.findOne({ _id: blogid, isDeleted: false })
            .populate('author', 'fullName email profileImage');

        if (!blog) {
            return sendErrorResponse(res, "Blog post not found", 404, true, true);
        }

        // Get unique identifier for this viewer
        const viewerId = getViewerIdentifier(req);

        // Check if this viewer has already viewed this blog
        const hasViewed = blog.viewedBy && blog.viewedBy.some(
            view => view.identifier === viewerId
        );

        // Only increment views if this is a new viewer
        if (!hasViewed) {
            // Initialize viewedBy array if it doesn't exist
            if (!blog.viewedBy) {
                blog.viewedBy = [];
            }

            // Add this viewer to the viewedBy array
            blog.viewedBy.push({
                identifier: viewerId,
                viewedAt: new Date()
            });

            // Increment view count
            blog.views += 1;
            await blog.save();
        }

        return sendSuccessResponse(res, { data: blog });
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

// Public: Get blog by slug
exports.getBlogBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const blog = await BlogModel.findOne({
            slug,
            status: 'published',
            isDeleted: false
        })
            .populate('author', 'fullName email profileImage');

        if (!blog) {
            return sendErrorResponse(res, "Blog post not found", 404, true, true);
        }

        // Get unique identifier for this viewer
        const viewerId = getViewerIdentifier(req);

        // Check if this viewer has already viewed this blog
        const hasViewed = blog.viewedBy && blog.viewedBy.some(
            view => view.identifier === viewerId
        );

        // Only increment views if this is a new viewer
        if (!hasViewed) {
            // Initialize viewedBy array if it doesn't exist
            if (!blog.viewedBy) {
                blog.viewedBy = [];
            }

            // Add this viewer to the viewedBy array
            blog.viewedBy.push({
                identifier: viewerId,
                viewedAt: new Date()
            });

            // Increment view count
            blog.views += 1;
            await blog.save();
        }

        return sendSuccessResponse(res, { data: blog });
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

// Public: Get published blogs
exports.getPublishedBlogs = async (req, res) => {
    try {
        const {
            category,
            tag,
            search,
            page = 1,
            limit = 10,
            featured
        } = req.query;

        const query = {
            status: 'published',
            isDeleted: false
        };

        if (category) query.categories = { $in: [category] };
        if (tag) query.tags = { $in: [tag] };
        if (featured === 'true') query.isFeatured = true;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const blogs = await BlogModel.find(query)
            .populate('author', 'fullName email profileImage')
            .sort({ publishedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('-content'); // Don't send full content in list

        const total = await BlogModel.countDocuments(query);

        return sendSuccessResponse(res, {
            data: blogs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

// Admin: Update blog
exports.updateBlog = async (req, res) => {
    try {
        const { blogid } = req.params;
        const updateData = req.body;

        let featuredImage = "";
        if (req?.files?.featuredImage) {
            featuredImage = req.files.featuredImage[0];
            const pathN = featuredImage?.path;
            const npathN = pathN.replaceAll("\\", "/");
            featuredImage.path = npathN;

            // Upload to Cloudflare R2
            const url = await r2.uploadPublic(featuredImage?.path, `${featuredImage?.filename}`, `Blogs`);
            updateData.featuredImage = url;
        }

        const blog = await BlogModel.findOne({ _id: blogid, isDeleted: false });

        if (!blog) {
            return sendErrorResponse(res, "Blog post not found", 404, true, true);
        }

        // If status is being changed to published, set publishedAt
        if (updateData.status === 'published' && blog.status !== 'published') {
            updateData.publishedAt = new Date();
        }

        Object.assign(blog, updateData);
        const updatedBlog = await blog.save();

        return sendSuccessResponse(res, {
            message: "Blog post updated successfully",
            data: updatedBlog
        });
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

// Admin: Delete blog (soft delete)
exports.deleteBlog = async (req, res) => {
    try {
        const { blogid } = req.params;
        const blog = await BlogModel.findOne({ _id: blogid, isDeleted: false });

        if (!blog) {
            return sendErrorResponse(res, "Blog post not found", 404, true, true);
        }

        blog.isDeleted = true;
        await blog.save();

        return sendSuccessResponse(res, {
            message: "Blog post deleted successfully"
        });
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

// Admin: Permanently delete blog
exports.permanentDeleteBlog = async (req, res) => {
    try {
        const { blogid } = req.params;
        const blog = await BlogModel.findByIdAndDelete(blogid);

        if (!blog) {
            return sendErrorResponse(res, "Blog post not found", 404, true, true);
        }

        return sendSuccessResponse(res, {
            message: "Blog post permanently deleted"
        });
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

