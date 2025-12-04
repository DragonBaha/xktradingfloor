const EventModel = require("../models/event.model");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");
const { getPagination, getPaginationData, escapeRegex } = require("../utils/fn");

// Create event
exports.createEvent = async (req, res) => {
    try {
        const event = new EventModel(req.body);
        const saved = await event.save();
        const e = saved.toObject();
        e.id = e._id.toString();
        return sendSuccessResponse(res, { message: "Event created", data: e }, 201);
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

// Get all events
exports.getAllEvents = async (req, res) => {
    try {
        const { type, search, page, size } = req.query;
        const { limit, offset } = getPagination(page, size);
        const searchTerm = escapeRegex(search);

        const query = {};
        if (type) query.type = type;
        if (searchTerm) {
            query.$or = [
                { title: { $regex: searchTerm, $options: "i" } },
                { description: { $regex: searchTerm, $options: "i" } },
            ];
        }

        const events = await EventModel.find(query)
            .sort({ dateTime: 1, createdAt: -1 })
            .skip(offset)
            .limit(limit);
        const totalItems = await EventModel.countDocuments(query);

        const transformed = events.map((event) => {
            const e = event.toObject();
            e.id = e._id.toString();
            return e;
        });

        return sendSuccessResponse(
            res,
            getPaginationData({ count: totalItems, docs: transformed }, page, limit)
        );
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

// Get event by ID
exports.getEventById = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await EventModel.findById(eventId);
        if (!event) {
            return sendErrorResponse(res, "Event not found", 404, true, true);
        }
        const e = event.toObject();
        e.id = e._id.toString();
        return sendSuccessResponse(res, { data: e });
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

// Update event
exports.updateEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await EventModel.findById(eventId);
        if (!event) {
            return sendErrorResponse(res, "Event not found", 404, true, true);
        }
        Object.assign(event, req.body);
        const updated = await event.save();
        const e = updated.toObject();
        e.id = e._id.toString();
        return sendSuccessResponse(res, { message: "Event updated", data: e });
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

// Delete event
exports.deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await EventModel.findByIdAndDelete(eventId);
        if (!event) {
            return sendErrorResponse(res, "Event not found", 404, true, true);
        }
        return sendSuccessResponse(res, { message: "Event deleted" });
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

// Register for an event
exports.registerForEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await EventModel.findById(eventId);
        if (!event) {
            return sendErrorResponse(res, "Event not found", 404, true, true);
        }

        const registration = {
            userId: req.user?._id || null,
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            registeredAt: new Date(),
        };

        if (!event.registrations) {
            event.registrations = [];
        }
        event.registrations.push(registration);
        const updated = await event.save();

        return sendSuccessResponse(res, {
            message: "Registered successfully",
            data: {
                eventId: updated._id.toString(),
                ...registration,
            },
        });
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};



