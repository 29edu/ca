const mongoose = require('mongoose');

const FarmerSchema = new mongoose.Schema(
    {
        name : {
            type : String,
            required : true,
            trim : true
        },
        phone : {
            type : String,
            required : true,
        },
        aadhar : {
            type : String,
            unique : true,
            sparse : true
        },
        address : {
            village: String,
            tehsil: String,
            district: String,
            state: String,
            pincode: String
        },
        createdBy : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        verified: {
        status: {
            type: Boolean,
            default: false,
        },
        verifiedAt: {
            type: Date,
        },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Farmer', FarmerSchema);