const FeeSection = require("../models/FeeSection");
const Due = require("../models/Due");
const Student = require("../models/Student");
const Department = require("../models/Department");

// Get fee section info (name, applicable departments)
exports.getFeeSectionInfo = async (req, res) => {
  try {
    const feeSection = await FeeSection.findById(req.user.refId)
      .populate("applicableDepartments", "name");

    if (!feeSection) {
      return res.status(404).json({ message: "Fee section not found" });
    }

    res.json(feeSection);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all students applicable to this fee section (with optional filters)
exports.getFeeSectionStudents = async (req, res) => {
  try {
    const feeSection = await FeeSection.findById(req.user.refId);
    if (!feeSection) return res.status(404).json({ message: "Fee section not found" });

    const { department, className } = req.query;

    const filter = {
      department: { $in: feeSection.applicableDepartments }
    };

    if (department) filter.department = department;
    if (className) filter.className = className;

    const students = await Student.find(filter)
      .populate("department", "name")
      .sort({ admissionNo: 1 });

    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get due sheet — students with dues in this fee section
exports.getFeeSectionDueSheet = async (req, res) => {
  try {
    const feeSection = await FeeSection.findById(req.user.refId)
      .populate("applicableDepartments", "name");

    if (!feeSection) return res.status(404).json({ message: "Fee section not found" });

    const { department, className, status } = req.query;

    // Build student filter
    const studentFilter = {
      department: { $in: feeSection.applicableDepartments.map(d => d._id) }
    };
    if (department) studentFilter.department = department;
    if (className) studentFilter.className = className;

    const students = await Student.find(studentFilter)
      .populate("department", "name");

    const studentIds = students.map(s => s._id);

    // Get dues for this fee section
    const dueFilter = {
      feeSection: feeSection._id,
      student: { $in: studentIds }
    };
    if (status) dueFilter.status = status;

    const dues = await Due.find(dueFilter)
      .populate("student", "name admissionNo className department")
      .populate({
        path: "student",
        populate: { path: "department", select: "name" }
      });

    const result = dues.map(due => ({
      _id: due._id,
      admissionNo: due.student?.admissionNo || "",
      name: due.student?.name || "",
      department: due.student?.department?.name || "",
      className: due.student?.className || "",
      amount: due.amount,
      dueDate: due.dueDate ? new Date(due.dueDate).toISOString().split("T")[0] : "-",
      status: due.status,
      remark: due.remark || "",
    }));

    res.json({
      feeSectionName: feeSection.name,
      departments: feeSection.applicableDepartments,
      dues: result,
      summary: {
        total: result.length,
        pending: result.filter(r => r.status === "pending").length,
        paid: result.filter(r => r.status === "paid").length,
        totalAmount: result.filter(r => r.status === "pending")
          .reduce((sum, r) => sum + r.amount, 0),
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add fee to students — manual (individual) or bulk (by filter)
exports.addFeeToStudents = async (req, res) => {
  try {
    const feeSection = await FeeSection.findById(req.user.refId);
    if (!feeSection) return res.status(404).json({ message: "Fee section not found" });

    const { mode, admissionNos, department, className, amount, dueDate, remark } = req.body;

    if (!amount || !dueDate) {
      return res.status(400).json({ message: "Amount and due date are required" });
    }

    let students = [];

    if (mode === "manual") {
      // Individual — by admission numbers
      if (!admissionNos || admissionNos.length === 0) {
        return res.status(400).json({ message: "No students selected" });
      }
      students = await Student.find({ admissionNo: { $in: admissionNos } });

    } else if (mode === "bulk") {
      // Bulk — by department/class filter
      const filter = {
        department: { $in: feeSection.applicableDepartments }
      };
      if (department) filter.department = department;
      if (className) filter.className = className;
      students = await Student.find(filter);
    }

    if (students.length === 0) {
      return res.status(400).json({ message: "No students found matching criteria" });
    }

    const results = [];

    for (const student of students) {
      const due = await Due.create({
        student: student._id,
        feeSection: feeSection._id,
        amount: Number(amount),
        dueDate,
        status: "pending",
        remark: remark || "",
        addedBy: "feeSection",
        addedByRef: feeSection._id,
      });

      results.push(due);
    }

    res.status(201).json({
      message: `Fee added to ${results.length} student(s) successfully.`,
      count: results.length,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Delete a due added by this fee section
exports.deleteFee = async (req, res) => {
  try {
    const { dueId } = req.body;
    const due = await Due.findById(dueId);
    if (!due) return res.status(404).json({ message: "Record not found" });

    // Ensure it belongs to this fee section
    if (due.feeSection.toString() !== req.user.refId.toString()) {
      return res.status(403).json({ message: "You can only delete fees from your own section" });
    }

    if (due.status === "paid") {
      return res.status(400).json({ message: "Cannot delete a paid fee record" });
    }

    await Due.findByIdAndDelete(dueId);
    res.json({ message: "Record deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};