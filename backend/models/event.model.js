const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = new Schema(
    {
        title: { type: String, required: true },
        description: String,
        date: Date,
        location: String,
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const EventModel = mongoose.model('event', EventSchema);
module.exports = EventModel;