const Student = require("../models/Student");
const Due = require("../models/Due");
const Department = require("../models/Department");
const FeeSection = require("../models/FeeSection");

// Get students and their mapped dues for a staff advisor
exports.getStudents = async (req, res) => {
    try {
        const { department, batch } = req.query;

        if (!department || !batch) {
            return res.status(400).json({ message: "Department and batch are required" });
        }

        let queryDept = department;
        
        // If department is a name instead of ObjectId, find its ID
        const mongoose = require("mongoose");
        if (!mongoose.Types.ObjectId.isValid(department)) {
          const deptDoc = await Department.findOne({ 
             name: { $regex: new RegExp(`^${department.trim()}$`, "i") } 
          });
          if (deptDoc) {
             queryDept = deptDoc._id;
          } else {
             // If we can't find the department ID, return empty list to avoid CastError
             return res.json({ students: [], columns: [] });
          }
        }

        // Fetch students belonging to the department and batch
        const students = await Student.find({ department: queryDept, className: batch }).populate("department", "name");

        if (!students.length) {
            return res.json({ students: [], columns: [] });
        }

        const studentIds = students.map(s => s._id);

        const dues = await Due.find({
            student: { $in: studentIds },
            status: "pending"
        }).populate("feeSection");

        // Fetch all fee sections for dynamic columns
        const allSections = await FeeSection.find({}).select("name");
        
        const fineSectionNames = allSections.filter(s => {
           const ln = s.name.toLowerCase();
           return ln.includes("hod") || ln.includes("advisor") || ln.includes("library") || ln.includes("fine");
        }).map(s => s.name);

        const dynamicSections = allSections
          .filter(s => !fineSectionNames.includes(s.name))
          .map(s => s.name);

        const columnList = [...dynamicSections, "Fine"];

        const processedStudents = students.map(student => {
            const studentDues = dues.filter(due => due.student.toString() === student._id.toString());
            
            let fees = { Fine: 0 };
            dynamicSections.forEach(name => { fees[name] = 0; });

            let totalPending = 0;

            studentDues.forEach(due => {
                if (due.feeSection && due.feeSection.name) {
                    const sectionName = due.feeSection.name;
                    if (fineSectionNames.includes(sectionName)) {
                        fees.Fine += due.amount;
                    } else if (dynamicSections.includes(sectionName)) {
                        fees[sectionName] += due.amount;
                    } else {
                        fees.Fine += due.amount;
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

        res.json({ students: processedStudents, columns: columnList });
    } catch (error) {
        console.error("Error fetching staff advisor students:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
