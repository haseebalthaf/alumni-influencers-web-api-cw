const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    biography: { type: String, maxlength: 500 },
  },
  linkedInUrl: {
    type: String,
    sparse: true,
    validate: {
      validator: function (v) {
        if (!v || v.trim() === "") return true;
        return /^https?:\/\/(www\.)?linkedin\.com\/.*$/.test(v);
      },
      message: "Must be a valid LinkedIn URL (or leave empty)",
    },
  },
  profileImage: String,
  degrees: [
    {
      title: { type: String, required: true },
      university: { type: String, required: true },
      completionDate: { type: Date, required: true },
      url: {
        type: String,
        validate: {
          validator: function (v) {
            return /^https?:\/\/.*$/.test(v);
          },
          message: "Must be a valid URL",
        },
      },
    },
  ],
  certifications: [
    {
      title: { type: String, required: true },
      issuingBody: { type: String, required: true },
      completionDate: { type: Date, required: true },
      url: {
        type: String,
        validate: {
          validator: function (v) {
            return /^https?:\/\/.*$/.test(v);
          },
          message: "Must be a valid URL",
        },
      },
    },
  ],
  licences: [
    {
      title: { type: String, required: true },
      issuingBody: { type: String, required: true },
      completionDate: { type: Date, required: true },
      url: {
        type: String,
        validate: {
          validator: function (v) {
            return /^https?:\/\/.*$/.test(v);
          },
          message: "Must be a valid URL",
        },
      },
    },
  ],
  courses: [
    {
      title: { type: String, required: true },
      provider: { type: String, required: true },
      completionDate: { type: Date, required: true },
      url: {
        type: String,
        validate: {
          validator: function (v) {
            return /^https?:\/\/.*$/.test(v);
          },
          message: "Must be a valid URL",
        },
      },
    },
  ],
  employmentHistory: [
    {
      position: { type: String, required: true },
      company: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: Date, // null if current
      description: String,
    },
  ],
  sponsorshipOffers: [
    {
      sponsorName: { type: String, required: true },
      amount: { type: Number, required: true, min: 0 },
      description: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  eventParticipationMonth: {
    type: String,
    default: null,
  },
  monthlyWins: {
    type: Number,
    default: 0,
  },
  lastWinMonth: {
    type: String, // YYYY-MM
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Profile", profileSchema);
