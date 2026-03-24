const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// GET all students
router.get('/', async (req, res) => {
    try {
        const students = await Student.find({});
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET students by room
router.get('/room/:room', async (req, res) => {
    try {
        const students = await Student.find({ room: req.params.room });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET student by admission number
router.get('/admission/:admissionNo', async (req, res) => {
    try {
        const student = await Student.findOne({ admissionNo: req.params.admissionNo }).populate('department');
        if (!student) return res.status(404).json({ message: "Student not found" });
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST enroll student to hostel
router.post('/enroll-hostel', async (req, res) => {
    try {
        const { admission, room, hostelName, name, department, className, gender } = req.body;
        if (!admission) return res.status(400).json({ message: "Admission number / ID is required" });

        let student = await Student.findOne({ admissionNo: admission });
        
        if (!student) {
            student = new Student({
                admissionNo: admission,
                name: name || "Unknown Inmate",
                department: department || undefined,
                className: className || "N/A",
                email: `${admission}@hostel.local`,
                gender: gender || "Other",
                phone: "0000000000",
                address: "Hostel",
            });
        }

        if (room) student.room = room;
        if (gender) student.gender = gender;
        student.hostelName = hostelName || ""; 
        await student.save();

        res.json({ message: "Student enrolled successfully", student });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST publish HDF amount
router.post('/hdf', async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount) return res.status(400).json({ message: "Amount is required" });

        // Update all students that have a hostelName assigned
        await Student.updateMany(
            { hostelName: { $exists: true, $ne: "" } },
            { $set: { HDF: amount, feeUpdatedAt: new Date() } }
        );

        res.json({ message: "HDF published successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST publish Rent amount
router.post('/rent', async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount) return res.status(400).json({ message: "Amount is required" });

        await Student.updateMany(
            { hostelName: { $exists: true, $ne: "" } },
            { $set: { HostelRent: amount, feeUpdatedAt: new Date() } }
        );

        res.json({ message: "Rent published successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT update attendance or mess cut
router.put("/attendance/:id", async (req, res) => {
  try {
    const { date, present, messCut } = req.body;

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 🔍 check if date already exists
    const existing = student.attendance.find(a => a.date === date);

    if (existing) {
      existing.present = present;
      existing.messCut = messCut;
    } else {
      student.attendance.push({ date, present, messCut });
    }

    await student.save();

    res.json(student);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE unenroll student from hostel
router.delete("/unenroll/:admissionNo", async (req, res) => {
  try {
    const { admissionNo } = req.params;
    
    // Try both string and number formats for robustness
    let student = await Student.findOne({ admissionNo: admissionNo });
    if (!student && !isNaN(admissionNo)) {
      student = await Student.findOne({ admissionNo: Number(admissionNo) });
    }

    if (!student) {
      console.log(`Unenrollment failed: Student ${admissionNo} not found.`);
      return res.status(404).json({ message: "Student not found" });
    }

    student.hostelName = "";
    student.room = "";
    await student.save();

    res.json({ message: "Student unenrolled from hostel successfully" });
  } catch (error) {
    console.error("Unenrollment error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

