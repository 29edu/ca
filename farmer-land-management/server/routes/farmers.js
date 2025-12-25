// server/routes/farmers.js
const express = require("express");
const Farmer = require("../models/Farmer");
const auth = require("../middleware/auth");
const role = require("../middleware/roles");

const router = express.Router();

// CREATE farmer (admin, worker)
router.post("/", auth, role(["admin", "worker"]), async (req, res) => {
  try {
    const farmer = new Farmer({
      ...req.body,
      createdBy: req.user._id,
    });

    await farmer.save();
    res.status(201).json(farmer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// LIST farmers (any logged-in user)
router.get("/", auth, async (req, res) => {
  try {
    const farmers = await Farmer.find().sort({ createdAt: -1 });
    res.json(farmers);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE farmer (admin, worker) - Must come before GET /:id
router.put("/:id", auth, role(["admin", "worker"]), async (req, res) => {
  try {
    const farmer = await Farmer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    res.json(farmer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// VERIFY farmer (admin only) - Specific route, must come before general GET /:id
router.put("/:id/verify", auth, role(["admin"]), async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);

    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    farmer.verified.status = true;
    farmer.verified.verifiedAt = new Date();

    await farmer.save();

    res.json({
      message: "Farmer verified successfully",
      farmer,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET farmer by ID - Should be last
router.get("/:id", auth, async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }
    res.json(farmer);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
