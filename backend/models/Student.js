const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    admissionNo: {
      type: String,
      required: true,
      unique: true,
      match: /^[1-9][0-9]{3,}$/,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    className: {
      type: String, // S1, S2, etc
      required: true,
    },

    batch: {
      type: String, // Example: 2024-2028
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Other"
    },

    email: {
      type: String,
      required: true,
    },

    room: {
      type: String,
      required: false,
    },

    hostelName: {
      type: String,
      required: false,
    },

    HDF: { type: Number, required: false },
    HostelRent: { type: Number, required: false },
    hdfPaidMonths: { type: Number, required: false, default: 0 },
    rentPaidMonths: { type: Number, required: false, default: 0 },
    feeUpdatedAt: { type: Date, required: false },

    attendance: {
      type: [
        {
          date: String,
          present: { type: Boolean, default: true },
          messCut: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Student", studentSchema);
