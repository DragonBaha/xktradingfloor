const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CompanySchema = new Schema(
    {
        name: { type: String, required: true },
        description: String,
        category: String,
        status: { type: String, default: 'pending' },
        ratingsAggregate: { type: Number, default: 0 },
        operatorId: { type: Schema.Types.ObjectId, ref: 'user' },
        promoCodes: [{ code: String, discount: Number }],
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const CompanyModel = mongoose.model('company', CompanySchema);
module.exports = CompanyModel;