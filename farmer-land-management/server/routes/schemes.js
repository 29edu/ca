const express = require("express");
const Scheme = require("../models/Scheme");
const auth = require("../middleware/auth");
const role = require("../middleware/roles");

const router = express.Router();

// CREATE scheme (TEMPORARY: role restriction removed for testing)
router.post("/", auth, async (req, res) => {
  try {
    const {
      title,
      schemeCode,
      description,
      benefits,
      eligibility,
      applicationDeadline,
    } = req.body;

    // Validation
    if (!title || !schemeCode) {
      return res.status(400).json({
        message: "Title and Scheme Code are required fields",
      });
    }

    // Check if scheme code already exists
    const existingScheme = await Scheme.findOne({
      schemeCode: schemeCode.toUpperCase(),
    });

    if (existingScheme) {
      return res.status(400).json({
        message: `Scheme with code '${schemeCode}' already exists`,
      });
    }

    // Validate land area if provided
    if (eligibility?.minLandArea && eligibility?.maxLandArea) {
      if (eligibility.minLandArea > eligibility.maxLandArea) {
        return res.status(400).json({
          message: "Minimum land area cannot be greater than maximum land area",
        });
      }
    }

    const scheme = new Scheme({
      title: title.trim(),
      schemeCode: schemeCode.toUpperCase().trim(),
      description: description?.trim() || "",
      benefits: benefits?.trim() || "",
      eligibility: {
        minLandArea: eligibility?.minLandArea || 0,
        maxLandArea: eligibility?.maxLandArea || 0,
        allowedDistricts: eligibility?.allowedDistricts || [],
      },
      applicationDeadline: applicationDeadline || null,
      isActive: true,
    });

    await scheme.save();

    res.status(201).json({
      message: "Scheme created successfully",
      scheme,
    });
  } catch (error) {
    console.error("Error creating scheme:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: "A scheme with this code already exists",
      });
    }

    res.status(400).json({
      message: error.message || "Failed to create scheme",
    });
  }
});

// LIST schemes (any logged-in user)
router.get("/", auth, async (req, res) => {
  try {
    const { active, district } = req.query;

    let filter = {};

    // Filter by active status
    if (active !== undefined) {
      filter.isActive = active === "true";
    }

    // Filter by district
    if (district) {
      filter.$or = [
        { "eligibility.allowedDistricts": { $size: 0 } }, // No district restriction
        { "eligibility.allowedDistricts": district },
      ];
    }

    const schemes = await Scheme.find(filter).sort({ createdAt: -1 });
    res.json(schemes);
  } catch (error) {
    console.error("Error fetching schemes:", error);
    res.status(500).json({ message: "Failed to fetch schemes" });
  }
});

// GET single scheme by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({ message: "Scheme not found" });
    }

    res.json(scheme);
  } catch (error) {
    console.error("Error fetching scheme:", error);
    res.status(500).json({ message: "Failed to fetch scheme details" });
  }
});

// UPDATE scheme (admin only)
router.put("/:id", auth, role(["admin"]), async (req, res) => {
  try {
    const { title, schemeCode, description, benefits, eligibility, isActive } =
      req.body;

    // If updating scheme code, check for duplicates
    if (schemeCode) {
      const existingScheme = await Scheme.findOne({
        schemeCode: schemeCode.toUpperCase(),
        _id: { $ne: req.params.id },
      });

      if (existingScheme) {
        return res.status(400).json({
          message: `Another scheme with code '${schemeCode}' already exists`,
        });
      }
    }

    // Validate land area if provided
    if (eligibility?.minLandArea && eligibility?.maxLandArea) {
      if (eligibility.minLandArea > eligibility.maxLandArea) {
        return res.status(400).json({
          message: "Minimum land area cannot be greater than maximum land area",
        });
      }
    }

    const updateData = {};
    if (title) updateData.title = title.trim();
    if (schemeCode) updateData.schemeCode = schemeCode.toUpperCase().trim();
    if (description !== undefined) updateData.description = description.trim();
    if (benefits !== undefined) updateData.benefits = benefits.trim();
    if (eligibility) updateData.eligibility = eligibility;
    if (isActive !== undefined) updateData.isActive = isActive;

    const scheme = await Scheme.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!scheme) {
      return res.status(404).json({ message: "Scheme not found" });
    }

    res.json({
      message: "Scheme updated successfully",
      scheme,
    });
  } catch (error) {
    console.error("Error updating scheme:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "A scheme with this code already exists",
      });
    }

    res.status(400).json({
      message: error.message || "Failed to update scheme",
    });
  }
});

// DELETE scheme (admin only)
router.delete("/:id", auth, role(["admin"]), async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndDelete(req.params.id);

    if (!scheme) {
      return res.status(404).json({ message: "Scheme not found" });
    }

    res.json({
      message: "Scheme deleted successfully",
      scheme,
    });
  } catch (error) {
    console.error("Error deleting scheme:", error);
    res.status(500).json({ message: "Failed to delete scheme" });
  }
});

// TOGGLE scheme active status (admin only)
router.patch("/:id/toggle-status", auth, role(["admin"]), async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({ message: "Scheme not found" });
    }

    scheme.isActive = !scheme.isActive;
    await scheme.save();

    res.json({
      message: `Scheme ${
        scheme.isActive ? "activated" : "deactivated"
      } successfully`,
      scheme,
    });
  } catch (error) {
    console.error("Error toggling scheme status:", error);
    res.status(500).json({ message: "Failed to update scheme status" });
  }
});

// GET schemes eligible for a farmer
router.get("/eligible/:farmerId", auth, async (req, res) => {
  try {
    const Farmer = require("../models/Farmer");
    const Land = require("../models/Land");

    const farmer = await Farmer.findById(req.params.farmerId);
    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    // Get farmer's lands and total area
    const lands = await Land.find({ farmerId: req.params.farmerId });
    const totalLandArea = lands.reduce(
      (sum, land) => sum + land.areaHectares,
      0
    );
    const farmerDistricts = [
      ...new Set(lands.map((land) => land.location.district)),
    ];

    // Find all active schemes
    const allSchemes = await Scheme.find({ isActive: true });
    const currentDate = new Date();

    const eligibleSchemes = allSchemes.filter((scheme) => {
      // Check if deadline has passed
      if (scheme.applicationDeadline) {
        const deadline = new Date(scheme.applicationDeadline);
        if (currentDate > deadline) {
          return false;
        }
      }

      // Check land area eligibility
      const minArea = scheme.eligibility?.minLandArea || 0;
      const maxArea = scheme.eligibility?.maxLandArea || Infinity;

      // If scheme has no max area set (0), treat as no upper limit
      const effectiveMaxArea = maxArea === 0 ? Infinity : maxArea;

      if (totalLandArea < minArea || totalLandArea > effectiveMaxArea) {
        return false;
      }

      // Check district eligibility
      const allowedDistricts = scheme.eligibility?.allowedDistricts || [];
      if (allowedDistricts.length > 0) {
        // Check if any of farmer's lands are in allowed districts
        const hasMatchingDistrict = farmerDistricts.some((district) =>
          allowedDistricts.includes(district)
        );
        if (!hasMatchingDistrict) {
          return false;
        }
      }

      return true;
    });

    res.json({
      farmer: {
        id: farmer._id,
        name: farmer.name,
        totalLandArea,
        districts: farmerDistricts,
      },
      eligibleSchemes,
      totalEligibleSchemes: eligibleSchemes.length,
    });
  } catch (error) {
    console.error("Error fetching eligible schemes:", error);
    res.status(500).json({ message: "Failed to fetch eligible schemes" });
  }
});

module.exports = router;
