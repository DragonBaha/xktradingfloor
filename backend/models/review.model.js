const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema(
    {
        companyId: { type: Schema.Types.ObjectId, ref: 'company', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        title: String,
        body: String,
        comment: String,
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const ReviewModel = mongoose.model('review', ReviewSchema);
module.exports = ReviewModel;