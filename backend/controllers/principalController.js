const Student = require("../models/Student");
const Due = require("../models/Due");

exports.getDashboardData = async (req, res) => {
    try {
        // Fetch all students and populate department
        const students = await Student.find().populate("department", "name");

        if (!students.length) {
            return res.json([]);
        }

        // Fetch all pending dues
        const dues = await Due.find({ status: { $in: ["pending", "Pending"] } }).populate("feeSection");

        // Map dues to students
        const processedStudents = students.map((student) => {
            const studentDues = dues.filter(due => due.student.toString() === student._id.toString());
            
            // Expected UI fields
            let fees = {
                PTA: 0,
                Bus: 0,
                HostelRent: 0,
                HDF: 0,
                Mess: 0,
                Library: 0,
                Lab: 0,
                CDF: 0,
                Accreditation: 0
            };

            studentDues.forEach(due => {
                if (due.feeSection && due.feeSection.name) {
                    const sectionName = due.feeSection.name.toLowerCase();
                    const amount = due.amount;

                    if (sectionName.includes("pta")) fees.PTA += amount;
                    else if (sectionName.includes("bus") || sectionName.includes("transport")) fees.Bus += amount;
                    else if (sectionName.includes("rent") || sectionName.includes("hostel")) fees.HostelRent += amount;
                    else if (sectionName.includes("hdf")) fees.HDF += amount;
                    else if (sectionName.includes("mess")) fees.Mess += amount;
                    else if (sectionName.includes("library")) fees.Library += amount;
                    else if (sectionName.includes("lab")) fees.Lab += amount;
                    else if (sectionName.includes("cdf")) fees.CDF += amount;
                    else if (sectionName.includes("accreditation")) fees.Accreditation += amount;
                }
            });

            return {
                admission: student.admissionNo || "N/A",
                name: student.name,
                department: student.department ? student.department.name : "N/A",
                ...fees
            };
        });

        res.json(processedStudents);
    } catch (error) {
        console.error("Error fetching principal dashboard data:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
