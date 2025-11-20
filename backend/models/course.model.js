const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema(
    {
        title: { type: String, required: true },
        description: String,
        resources: [String]
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const CourseModel = mongoose.model('course', CourseSchema);
module.exports = CourseModel;