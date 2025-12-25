const express = require("express");
const Land = require("../models/Land");
const auth = require("../middleware/auth");
const role = require("../middleware/roles");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const lands = await Land.find()
      .populate("farmerId", "name phoneNumber") // Show who owns the land
      .sort({ createdAt: -1 }); // Newest first

    res.json(lands);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ADD land (any authenticated user can add land)
router.post("/", auth, async (req, res) => {
  try {
    const land = new Land(req.body);
    await land.save();
    res.status(201).json(land);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET lands by farmer (MUST come before /:id to avoid conflict)
router.get("/farmer/:farmerId", auth, async (req, res) => {
  try {
    const lands = await Land.find({ farmerId: req.params.farmerId });
    res.json(lands);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE land (any authenticated user) - MUST come before /:id GET to match PUT first
router.put("/:id", auth, async (req, res) => {
  try {
    const land = await Land.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!land) {
      return res.status(404).json({ message: "Land not found" });
    }

    res.json(land);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET land by ID (should be last among /:id routes)
router.get("/:id", auth, async (req, res) => {
  try {
    const land = await Land.findById(req.params.id).populate(
      "farmerId",
      "name phoneNumber"
    );
    if (!land) {
      return res.status(404).json({ message: "Land not found" });
    }
    res.json(land);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE land (any authenticated user)
router.put("/:id", auth, async (req, res) => {
  try {
    const land = await Land.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!land) {
      return res.status(404).json({ message: "Land not found" });
    }

    res.json(land);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
