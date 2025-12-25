const express = require("express");
const Enrollment = require("../models/Enrollment");
const auth = require("../middleware/auth");
const role = require("../middleware/roles");
const Farmer = require("../models/Farmer");
const Land = require("../models/Land");
const Scheme = require("../models/Scheme");

const router = express.Router();

// GET ALL Enrollments (for Admin Dashboard)
// ✅ Restored 'role' check and removed debug logs
router.get("/", auth, role(["admin", "worker"]), async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate("farmerId", "name phoneNumber")
      .populate("schemeId", "title")
      .populate("landId", "location surveyNumber")
      .sort({ createdAt: -1 });

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// APPLY for scheme (admin, worker)
router.post("/", auth, role(["admin", "worker"]), async (req, res) => {
  try {
    const { farmerId, landId, schemeId, remarks } = req.body;

    // 1️⃣ Fetch data
    const farmer = await Farmer.findById(farmerId);
    const land = await Land.findById(landId);
    const scheme = await Scheme.findById(schemeId);

    if (!farmer || !land || !scheme) {
      return res.status(400).json({ message: "Invalid farmer / land / scheme" });
    }

    // 2️⃣ Check land area
    if (
      scheme.eligibility?.minLandArea &&
      land.areaHectares < scheme.eligibility.minLandArea
    ) {
      return res.status(400).json({
        message: "Land area is less than required for this scheme",
      });
    }

    // 3️⃣ Check district
    if (
      scheme.eligibility?.allowedDistricts?.length &&
      !scheme.eligibility.allowedDistricts.includes(land.location.district)
    ) {
      return res.status(400).json({
        message: "Land district not eligible for this scheme",
      });
    }

    // 4️⃣ Eligible → create enrollment
    const enrollment = await Enrollment.create({
      farmerId,
      landId,
      schemeId,
      remarks,
      status: "applied",
    });

    res.status(201).json({
      message: "Enrollment successful",
      enrollment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET enrollments by farmer
router.get("/farmer/:farmerId", auth, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      farmerId: req.params.farmerId,
    })
      .populate("schemeId", "title schemeCode")
      .populate("landId", "surveyNumber areaHectares");

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// APPROVE / REJECT enrollment (admin, worker)
router.put("/:id/status", auth, role(["admin", "worker"]), async (req, res) => {
  try {
    const { status, remarks } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    enrollment.status = status;
    enrollment.remarks = remarks;

    await enrollment.save();

    res.json({
      message: `Enrollment ${status} successfully`,
      enrollment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ NEW ROUTE: DELETE Enrollment (Admin only)
router.delete("/:id", auth, role(["admin"]), async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }
    
    await enrollment.deleteOne();
    res.json({ message: "Enrollment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;