const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema(
    {
        companyId: { type: Schema.Types.ObjectId, ref: 'company' },
        userId: { type: Schema.Types.ObjectId, ref: 'user' },
        rating: { type: Number, required: true },
        comment: String,
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const ReviewModel = mongoose.model('review', ReviewSchema);
module.exports = ReviewModel;