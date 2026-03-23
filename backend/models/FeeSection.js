const mongoose = require("mongoose");

const feeSectionSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    category: { type: String, default: null },
    responsibleStaff: { type: String, default: null }, // ✅ e.g. "Clerk", "JS", "SS"
    applicableDepartments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
    }],
    permissions: {
        canAddFee: { type: Boolean, default: true },
        canViewDues: { type: Boolean, default: true }
    },
    username: { type: String, default: null }, // ✅ stored here
    password: { type: String, default: null }, // ✅ stored here
}, { timestamps: true });

module.exports = mongoose.model("FeeSection", feeSectionSchema);