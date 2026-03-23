const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: [
        "admin",
        "student",
        "faculty",
        "hod",
        "staffAdvisor",
        "messManager",
        "principal",
        "feeManager",
        "hostelManager"
      ],
      required: true,
    },

    refId: {
      type: mongoose.Schema.Types.ObjectId,
      required: function () {
        return !["admin", "principal", "messManager", "hostelManager"].includes(this.role);
      },
    },
    refModel: {
      type: String,
      required: function () {
        return !["admin", "principal", "messManager", "hostelManager"].includes(this.role);
      },
    },
  },
  { timestamps: true },
);

// ✅ FIXED middleware (no next)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  if (this.password.startsWith("$2b$")) return; // prevent double hash

  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("User", userSchema);
