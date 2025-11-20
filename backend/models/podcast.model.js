const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PodcastSchema = new Schema(
    {
        title: { type: String, required: true },
        description: String,
        url: String,
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const PodcastModel = mongoose.model('podcast', PodcastSchema);
module.exports = PodcastModel;