const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CompanySchema = new Schema(
    {
        name: { type: String, required: true },
        description: String,
        details: String,
        category: { type: String, enum: ['Broker', 'PropFirm', 'Crypto'] },
        website: String,
        logo: String,
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        ratingsAggregate: { type: Number, default: 0 },
        totalReviews: { type: Number, default: 0 },
        addedBy: { type: Schema.Types.ObjectId, ref: 'user' },
        adminId: { type: Schema.Types.ObjectId, ref: 'user' },
        promoCodes: [{
            id: String,
            code: { type: String, required: true },
            discount: { type: Number, required: true },
            discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
            validFrom: Date,
            validTo: Date,
            terms: String,
            featured: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now }
        }],
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const CompanyModel = mongoose.model('company', CompanySchema);
module.exports = CompanyModel;