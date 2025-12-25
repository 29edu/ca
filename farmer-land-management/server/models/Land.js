const mongoose = require("mongoose");

const LandSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer",
      required: true,
    },
    surveyNumber: {
      type: String,
      required: true,
    },
    areaHectares: {
      type: Number,
      required: true,
    },
    cropType: {
      type: String,
    },
    irrigationType: {
      type: String,
    },
    location: {
      village: String,
      district: String,
      state: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Land", LandSchema);
