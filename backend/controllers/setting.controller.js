const { sendErrorResponse, sendSuccessResponse } = require("../utils/response");
const SettingModel = require("../models/setting.model");

exports.mockMode = async (req, res) => {
    try {
        const settings = await SettingModel.findOne({}).select('mockMode').lean();

        return sendSuccessResponse(res, {
            data: {
                enabled: settings?.mockMode?.enabled || false
            }
        });
    } catch (err) {
        return sendErrorResponse(res, err);
    }
};

exports.updateMockMode = async (req, res) => {
    try {
        const { enabled } = req.body;
        const { _id: userId } = req.user;

        if (typeof enabled !== 'boolean') {
            return sendErrorResponse(res, "Invalid input. 'enabled' must be a boolean value", 400, true, true);
        }

        let settings = await SettingModel.findOne({});

        if (!settings) {
            settings = new SettingModel({});
        }

        settings.mockMode = {
            enabled: enabled,
            updatedBy: userId,
            updatedAt: new Date()
        };

        await settings.save();

        return sendSuccessResponse(res, {
            message: "Mock mode updated successfully",
            enabled: settings.mockMode.enabled
        });
    } catch (err) {
        return sendErrorResponse(res, err);
    }
};