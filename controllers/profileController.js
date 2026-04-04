const Profile = require("../models/Profile");
const multer = require("multer");
const path = require("path");

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user._id}_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const profile = await Profile.findOne({ user: req.user._id });

    if (!profile) {
      return res
        .status(404)
        .json({ message: "Profile not found. Please create a profile first." });
    }

    res.json(profile);
  } catch (error) {
    console.error("Get profile error:", error);
    res
      .status(500)
      .json({
        message: "Server error while retrieving profile",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
  }
};

const createOrUpdateProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const {
      personalInfo,
      linkedInUrl,
      degrees,
      certifications,
      licences,
      courses,
      employmentHistory,
      sponsorshipOffers,
      eventParticipationThisMonth,
    } = req.body;

    // Validate required fields
    if (!personalInfo || !personalInfo.firstName || !personalInfo.lastName) {
      return res
        .status(400)
        .json({ message: "First name and last name are required" });
    }

    if (sponsorshipOffers && !Array.isArray(sponsorshipOffers)) {
      return res
        .status(400)
        .json({ message: "Sponsorship offers must be an array" });
    }

    let profile = await Profile.findOne({ user: req.user._id });
    const isNewProfile = !profile;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const eventParticipationMonth = eventParticipationThisMonth
      ? currentMonth
      : undefined;

    if (profile) {
      // Update existing profile
      profile.personalInfo = personalInfo;
      profile.linkedInUrl = linkedInUrl || undefined;
      profile.degrees = degrees || [];
      profile.certifications = certifications || [];
      profile.licences = licences || [];
      profile.courses = courses || [];
      profile.employmentHistory = employmentHistory || [];
      profile.sponsorshipOffers =
        sponsorshipOffers || profile.sponsorshipOffers || [];
      if (eventParticipationMonth) {
        profile.eventParticipationMonth = eventParticipationMonth;
      }
    } else {
      // Create new profile
      profile = new Profile({
        user: req.user._id,
        personalInfo,
        linkedInUrl: linkedInUrl || undefined,
        degrees: degrees || [],
        certifications: certifications || [],
        licences: licences || [],
        courses: courses || [],
        employmentHistory: employmentHistory || [],
        sponsorshipOffers: sponsorshipOffers || [],
        eventParticipationMonth: eventParticipationMonth || null,
      });
    }

    await profile.save();
    res.status(isNewProfile ? 201 : 200).json(profile);
  } catch (error) {
    console.error("Profile save error:", error);
    res
      .status(500)
      .json({
        message: "Server error while saving profile",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
  }
};

const uploadProfileImage = [
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ message: "No file uploaded. Please provide an image file." });
      }

      const profile = await Profile.findOne({ user: req.user._id });

      if (!profile) {
        return res
          .status(404)
          .json({
            message: "Profile not found. Please create a profile first.",
          });
      }

      profile.profileImage = req.file.filename;
      await profile.save();

      res.json({
        message: "Image uploaded successfully",
        filename: req.file.filename,
      });
    } catch (error) {
      console.error("Upload image error:", error);
      res
        .status(500)
        .json({
          message: "Server error while uploading image",
          error:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
  },
];

const getProfileImage = (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(process.env.UPLOAD_PATH, filename);

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Image retrieval error:", err);
      res.status(404).json({ message: "Image not found" });
    }
  });
};

const searchProfiles = async (req, res) => {
  try {
    const { name, company } = req.query;

    let query = {};

    if (name) {
      query.$or = [
        { "personalInfo.firstName": new RegExp(name, "i") },
        { "personalInfo.lastName": new RegExp(name, "i") },
      ];
    }

    if (company) {
      query["employmentHistory.company"] = new RegExp(company, "i");
    }

    const profiles = await Profile.find(query)
      .select("personalInfo employmentHistory")
      .limit(20);

    res.json(profiles);
  } catch (error) {
    console.error("Search profiles error:", error);
    res.status(500).json({ message: "Server error while searching profiles" });
  }
};

const getProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const profile = await Profile.findOne({ user: id });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("Get profile by ID error:", error);
    res
      .status(500)
      .json({
        message: "Server error while retrieving profile",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
  }
};

module.exports = {
  getProfile,
  createOrUpdateProfile,
  uploadProfileImage,
  getProfileImage,
  searchProfiles,
  getProfileById,
};
