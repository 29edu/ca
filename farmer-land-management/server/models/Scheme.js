const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Scheme title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    schemeCode: {
      type: String,
      required: [true, "Scheme code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      match: [
        /^[A-Z0-9-]+$/,
        "Scheme code can only contain letters, numbers, and hyphens",
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    eligibility: {
      minLandArea: {
        type: Number,
        default: 0,
        min: [0, "Minimum land area cannot be negative"],
      },
      maxLandArea: {
        type: Number,
        default: 0,
        min: [0, "Maximum land area cannot be negative"],
      },
      allowedDistricts: {
        type: [String],
        default: [],
      },
    },
    benefits: {
      type: String,
      trim: true,
      maxlength: [5000, "Benefits description cannot exceed 5000 characters"],
    },
    applicationDeadline: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
schemeSchema.index({ schemeCode: 1 });
schemeSchema.index({ isActive: 1 });
schemeSchema.index({ "eligibility.allowedDistricts": 1 });

// Virtual for enrollment count (if needed later)
schemeSchema.virtual("enrollmentCount", {
  ref: "Enrollment",
  localField: "_id",
  foreignField: "scheme",
  count: true,
});

// Method to check if a farmer is eligible based on land area
schemeSchema.methods.isEligibleByLandArea = function (totalLandArea) {
  const minArea = this.eligibility?.minLandArea || 0;
  const maxArea = this.eligibility?.maxLandArea || Infinity;
  return totalLandArea >= minArea && totalLandArea <= maxArea;
};

// Method to check if a district is eligible
schemeSchema.methods.isDistrictEligible = function (district) {
  const allowedDistricts = this.eligibility?.allowedDistricts || [];
  if (allowedDistricts.length === 0) return true; // No district restriction
  return allowedDistricts.includes(district);
};

// Static method to find active schemes
schemeSchema.statics.findActive = function () {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

module.exports = mongoose.model("Scheme", schemeSchema);
