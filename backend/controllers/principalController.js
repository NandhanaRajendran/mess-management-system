const Student = require("../models/Student");
const Due = require("../models/Due");
const FeeSection = require("../models/FeeSection");

exports.getDashboardData = async (req, res) => {
    try {
        const students = await Student.find().populate("department", "name");

        if (!students.length) {
            return res.json({ students: [], columns: [] });
        }

        const dues = await Due.find({ status: { $in: ["pending", "Pending"] } }).populate("feeSection");

        const allSections = await FeeSection.find({}).select("name");
        
        const fineSectionNames = allSections.filter(s => {
           const ln = s.name.toLowerCase();
           return ln.includes("hod") || ln.includes("advisor") || ln.includes("library") || ln.includes("fine");
        }).map(s => s.name);

        const dynamicSections = allSections
          .filter(s => !fineSectionNames.includes(s.name))
          .map(s => s.name);

        const columnList = [...dynamicSections, "Fine"];

        const processedStudents = students.map((student) => {
            const studentDues = dues.filter(due => due.student.toString() === student._id.toString());
            
            let fees = { Fine: 0 };
            dynamicSections.forEach(name => { fees[name] = 0; });

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
                }
            });

            return {
                admission: student.admissionNo || "N/A",
                name: student.name,
                department: student.department ? student.department.name : "N/A",
                ...fees
            };
        });

        res.json({ students: processedStudents, columns: columnList });
    } catch (error) {
        console.error("Error fetching principal dashboard data:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
