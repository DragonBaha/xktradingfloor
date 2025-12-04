const PodcastModel = require("../models/podcast.model");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");
const { getPagination, getPaginationData, escapeRegex } = require("../utils/fn");

// Create podcast
exports.createPodcast = async (req, res) => {
    try {
        const podcast = new PodcastModel(req.body);
        const saved = await podcast.save();
        const p = saved.toObject();
        p.id = p._id.toString();
        return sendSuccessResponse(res, { message: "Podcast created", data: p }, 201);
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

// Get all podcasts
exports.getAllPodcasts = async (req, res) => {
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

        const podcasts = await PodcastModel.find(query)
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit);
        const totalItems = await PodcastModel.countDocuments(query);

        const transformed = podcasts.map((podcast) => {
            const p = podcast.toObject();
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

// Get podcast by ID
exports.getPodcastById = async (req, res) => {
    try {
        const { podcastId } = req.params;
        const podcast = await PodcastModel.findById(podcastId);
        if (!podcast) {
            return sendErrorResponse(res, "Podcast not found", 404, true, true);
        }
        const p = podcast.toObject();
        p.id = p._id.toString();
        return sendSuccessResponse(res, { data: p });
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

// Update podcast
exports.updatePodcast = async (req, res) => {
    try {
        const { podcastId } = req.params;
        const podcast = await PodcastModel.findById(podcastId);
        if (!podcast) {
            return sendErrorResponse(res, "Podcast not found", 404, true, true);
        }
        Object.assign(podcast, req.body);
        const updated = await podcast.save();
        const p = updated.toObject();
        p.id = p._id.toString();
        return sendSuccessResponse(res, { message: "Podcast updated", data: p });
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

// Delete podcast
exports.deletePodcast = async (req, res) => {
    try {
        const { podcastId } = req.params;
        const podcast = await PodcastModel.findByIdAndDelete(podcastId);
        if (!podcast) {
            return sendErrorResponse(res, "Podcast not found", 404, true, true);
        }
        return sendSuccessResponse(res, { message: "Podcast deleted" });
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};