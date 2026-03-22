const Student = require("../models/Student");
const Due = require("../models/Due");
const Department = require("../models/Department");

// Get students and their mapped dues for a staff advisor
exports.getStudents = async (req, res) => {
    try {
        const { department, batch } = req.query;

        if (!department || !batch) {
            return res.status(400).json({ message: "Department and batch are required" });
        }

        // Fetch students belonging to the department and batch
        const students = await Student.find({ department, className: batch }).populate("department", "name");

        if (!students.length) {
            return res.json([]);
        }

        const studentIds = students.map(s => s._id);

        // Fetch pending dues for these students
        // Populate feeSection to know what category (Library, PTA, etc.)
        const dues = await Due.find({
            student: { $in: studentIds },
            status: "pending"
        }).populate("feeSection");

        // Map dues to specific fee columns expected by the frontend
        // Expected columns: Library, PTA, HDF, Rent, Mess
        const processedStudents = students.map(student => {
            const studentDues = dues.filter(due => due.student.toString() === student._id.toString());
            
            let fees = {
                Library: 0,
                PTA: 0,
                HDF: 0,
                Rent: 0,
                Mess: 0
            };

            let totalPending = 0;

            studentDues.forEach(due => {
                if (due.feeSection && due.feeSection.name) {
                    const sectionName = due.feeSection.name;
                    // Map to expected keys if they match or exist
                    if (fees.hasOwnProperty(sectionName)) {
                        fees[sectionName] += due.amount;
                    } else if (sectionName.toLowerCase().includes("mess")) {
                        fees.Mess += due.amount;
                    } else if (sectionName.toLowerCase().includes("rent") || sectionName.toLowerCase().includes("hostel")) {
                        fees.Rent += due.amount;
                    } else if (sectionName.toLowerCase().includes("library")) {
                        fees.Library += due.amount;
                    } else if (sectionName.toLowerCase().includes("pta")) {
                        fees.PTA += due.amount;
                    } else if (sectionName.toLowerCase().includes("hdf")) {
                        fees.HDF += due.amount;
                    }
                    totalPending += due.amount;
                }
            });

            return {
                id: student._id,
                admissionNumber: student.admissionNo || "N/A",
                name: student.name,
                department: student.department ? student.department.name : "N/A",
                batch: student.className,
                status: totalPending > 0 ? "Pending" : "Paid",
                fees
            };
        });

        res.json(processedStudents);
    } catch (error) {
        console.error("Error fetching staff advisor students:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
