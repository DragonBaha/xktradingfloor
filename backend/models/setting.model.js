const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SettingSchema = new Schema(
    {
        mockMode: {
            enabled: {
                type: Boolean,
                default: false
            },
            updatedBy: {
                type: Schema.Types.ObjectId,
                ref: 'user',
                default: null
            },
            updatedAt: {
                type: Date,
                default: Date.now
            }
        },
        // maintenanceMode: {
        //     enabled: { type: Boolean, default: false },
        //     message: { type: String, default: '' }
        // },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const SettingModel = mongoose.model('setting', SettingSchema);
module.exports = SettingModel;

