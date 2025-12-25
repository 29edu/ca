const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Farmer = require("../models/Farmer");
const Land = require("../models/Land");
const Scheme = require("../models/Scheme");
const Enrollment = require("../models/Enrollment");

// GET /api/dashboard/stats
router.get("/stats", auth, async (req, res) => {
  try {
    // Run all queries in parallel for speed
    const [
      farmerCount,
      landCount,
      schemeCount,
      pendingCount,
      approvedCount,
      rejectedCount,
      recentEnrollments,
    ] = await Promise.all([
      Farmer.countDocuments(),
      Land.countDocuments(),
      Scheme.countDocuments(),
      Enrollment.countDocuments({ status: "applied" }),
      Enrollment.countDocuments({ status: "approved" }),
      Enrollment.countDocuments({ status: "rejected" }),
      Enrollment.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("farmerId", "name")
        .populate("schemeId", "title"),
    ]);

    // Calculate Total Land Area (Optional aggregation)
    const landArea = await Land.aggregate([
      { $group: { _id: null, total: { $sum: "$areaHectares" } } },
    ]);
    const totalArea = landArea.length > 0 ? landArea[0].total.toFixed(1) : 0;

    // Crop distribution by count of plots per cropType
    const cropAgg = await Land.aggregate([
      { $match: { cropType: { $ne: null } } },
      { $group: { _id: "$cropType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const cropDistribution = cropAgg.map((item) => ({
      name: item._id,
      value: item.count,
    }));

    res.json({
      farmers: farmerCount,
      lands: landCount,
      schemes: schemeCount,
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
      totalArea: totalArea,
      recent: recentEnrollments,
      cropDistribution,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
