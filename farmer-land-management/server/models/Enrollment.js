const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema(
    {
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Farmer",
            required: true,
        },
        landId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Land",
            required: true,
        },
        schemeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Scheme",
            required: true,
        },
        status: {
            type: String,
            enum: ["applied", "approved", "rejected"],
            default: "approved",
        },
        remarks: {
            type: String,
        },
    }, 
    {timestamps: true}
);

module.exports = mongoose.model('Enrollment', EnrollmentSchema);