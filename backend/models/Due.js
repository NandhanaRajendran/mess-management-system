const mongoose = require("mongoose");

const dueSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    feeSection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeSection",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending"
    },
    dueDate: {           // ✅ add this
        type: Date,
        default: null
    },
    remark: {            // ✅ add this
        type: String,
        default: null
    },
    addedBy: {
        type: String,
        default: null
    },
    addedByRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Faculty",
        default: null
    },
}, { timestamps: true });

module.exports = mongoose.model("Due", dueSchema);