const Student = require("../models/Student");
const User = require("../models/User");
const generatePassword = require("../utils/generatePassword");
const Faculty = require("../models/Faculty");
const Department = require("../models/Department");
const FeeSection = require("../models/FeeSection");
const Due = require("../models/Due");
//const sendEmail = require("../utils/sendEmail");

exports.createStudent = async (req, res) => {
  try {
    const { name, admissionNo, department, className, batch, email } = req.body;

    //console.log("Incoming body: ",req.body);

    //const dept = await Department.findOne({name:department});
    const dept = await Department.findById(department);

    if (!dept) {
      return res.status(400).json({ message: "Department not found" });
    }

    const existing = await Student.findOne({ admissionNo });
    if (existing) {
      return res.status(400).json({ message: "Student already exists" });
    }

    // generate password FIRST
    const password = generatePassword();

    // create student
    const student = await Student.create({
      name,
      admissionNo,
      department: dept._id,
      className,
      batch,
      email,
    });

    await generateDuesForStudent(student);

    try {
      // create user
      await User.create({
        username: admissionNo,
        password,
        role: "student",
        refId: student._id,
        refModel: "Student",
      });
    } catch (err) {
      // rollback student if user fails
      await Student.findByIdAndDelete(student._id);

      return res.status(500).json({
        error: "User creation failed",
        details: err.message,
      });
    }

    res.status(201).json({
      message: "Student created successfully",
      credentials: {
        username: admissionNo,
        password,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.clearDatabase = async (req, res) => {
  try {
    const Student = require("../models/Student");
    const User = require("../models/User");

    await Student.deleteMany({});
    await User.deleteMany({});

    res.json({ message: "Database cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addFaculty = async (req, res) => {
  try {
    const { name, department, email, phone } = req.body;

    const existing = await Faculty.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Faculty already exists with this email" });
    }

    //const dept = await Department.findOne({name:department});

    const dept = await Department.findById(department);

    if (!dept) {
      return res.status(404).json({ message: "Department not found" });
    }

    const facultyId = "FAC" + Date.now().toString().slice(-5);

    const faculty = await Faculty.create({
      name,
      facultyId,
      department: dept._id,
      email,
      phone,
    });

    const password = generatePassword();

    await User.create({
      username: facultyId,
      password,
      role: "faculty",
      refId: faculty._id,
      refModel: "Faculty",
    });

    // await sendEmail(
    //     email,
    //     "UNIPAY Login Credentials",
    //     `Hello ${name},

    //     Your account has been created.

    //     Username: ${facultyId}
    //     Password: ${password}

    //     Please login and change your password.

    //     - UNIPAY`
    // );

    res.status(201).json({
      message: "Faculty added successfully",
      credentials: {
        username: facultyId,
        password,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    const exists = await Department.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: "Department exists" });
    }

    const dept = await Department.create({
      name,
      hod: null,
      advisors: {},
      activeClasses: ["S1"],
    });

    res.status(201).json({
      message: "Department created",
      department: dept,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.assignHod = async (req, res) => {
  try {
    const { departmentId, facultyId } = req.body;

    const dept = await Department.findById(departmentId);
    if (!dept) {
      return res.status(404).json({ message: "Department not found" });
    }

    const newHod = await Faculty.findById(facultyId);
    if (!newHod) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    // STEP 1: Remove old HOD
    if (dept.hod) {
      const oldHod = await Faculty.findById(dept.hod);
      if (oldHod) {
        oldHod.role = "faculty";
        await oldHod.save();
      }
    }

    // STEP 2: Assign new HOD
    dept.hod = newHod._id;
    await dept.save();

    newHod.role = "hod";
    await newHod.save();

    // STEP 3: Handle login
    const password = generatePassword();
    const deptShort = dept.name
      .split(" ")
      .map((w) => w.slice(0, 3))
      .join("")
      .toLowerCase()
      .slice(0, 8);

    const username = `hod_${deptShort}`;
    dept.username = username;
    dept.password = password;
    await dept.save();
    let user = await User.findOne({ username });

    if (user) {
      // update password only
      user.password = password;
      user.refId = newHod._id; // update reference to new HOD
      await user.save();
    } else {
      //  create only once
      user = await User.create({
        username,
        password,
        role: "hod",
        refId: newHod._id,
        refModel: "Faculty",
      });
    }

    res.json({
      message: "HOD assigned successfully",
      department: dept,
      credentials: {
        username,
        password,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.assignAdvisor = async (req, res) => {
  try {
    const { departmentId, semester, facultyId } = req.body;
    console.log("assignAdvisor called:", { departmentId, semester, facultyId });

    const dept = await Department.findById(departmentId);
    if (!dept) return res.status(404).json({ message: "Department not found" });

    // STEP 1: Remove old advisor for this semester
    const oldEntry = dept.advisors.find((a) => a.className === semester);
    if (oldEntry?.faculty) {
      const oldAdvisor = await Faculty.findById(oldEntry.faculty);
      if (oldAdvisor) {
        oldAdvisor.role = "faculty";
        await oldAdvisor.save();
      }
    }

    // STEP 2: Handle unassign
    if (!facultyId) {
      dept.advisors = dept.advisors.filter((a) => a.className !== semester);
      if (dept.advisorCredentials)
        dept.advisorCredentials = dept.advisorCredentials.filter(
          (a) => a.className !== semester,
        );
      await dept.save();

      // return populated dept
      const updated = await Department.findById(dept._id).populate(
        "advisors.faculty",
        "name facultyId",
      );
      return res.json({ message: "Advisor removed", department: updated });
    }

    // STEP 3: Assign new advisor
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    faculty.role = "staffAdvisor";
    await faculty.save();

    // update or insert in advisors array
    const existingIndex = dept.advisors.findIndex(
      (a) => a.className === semester,
    );
    if (existingIndex >= 0) {
      dept.advisors[existingIndex].faculty = faculty._id;
    } else {
      dept.advisors.push({ className: semester, faculty: faculty._id });
    }

    // STEP 4: Generate credentials
    const deptShort = dept.name
      .split(" ")
      .map((w) => w.slice(0, 3))
      .join("")
      .toLowerCase()
      .slice(0, 6);

    const semShort = semester.toLowerCase(); 
    const username = `${semShort}_${deptShort}_adv`;
    const password = generatePassword();

    // update or insert credentials
    if (!dept.advisorCredentials) dept.advisorCredentials = [];
    const credIndex = dept.advisorCredentials.findIndex(
      (a) => a.className === semester,
    );
    if (credIndex >= 0) {
      dept.advisorCredentials[credIndex].username = username;
      dept.advisorCredentials[credIndex].password = password;
    } else {
      dept.advisorCredentials.push({ className: semester, username, password });
    }

    await dept.save();

    // STEP 5: Create or update User login
    let user = await User.findOne({ username });
    if (user) {
      user.password = password;
      user.refId = faculty._id;
      await user.save();
    } else {
      await User.create({
        username,
        password,
        role: "staffAdvisor",
        refId: faculty._id,
        refModel: "Faculty",
      });
    }

    // ✅ return POPULATED department so frontend shows name immediately
    const updatedDept = await Department.findById(dept._id).populate(
      "advisors.faculty",
      "name facultyId",
    );

    res.json({
      message: "Staff Advisor assigned successfully",
      department: updatedDept,
      credentials: { username, password }, // ✅ this fixes the undefined alert
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.createFeeSection = async (req, res) => {
  try {
    const { name, category, responsibleStaff, applicableDepartments, permissions } = req.body;

    const departments = await Department.find({ _id: { $in: applicableDepartments } });
    const deptIds = departments.map(d => d._id);

    const password = generatePassword();
    const username = `fee_${name.toLowerCase().replace(/\s+/g, "_")}`;

    const feeSection = await FeeSection.create({
      name,
      category: category || null,
      responsibleStaff: responsibleStaff || null,
      applicableDepartments: deptIds,
      permissions: permissions || { canAddFee: true, canViewDues: true },
      username,  // ✅ save on document
      password,  // ✅ save on document
    });

    await User.create({
      username,
      password,
      role: "feeManager",
      refId: feeSection._id,
      refModel: "FeeSection",
    });

    res.status(201).json({
      message: "Fee section created successfully",
      credentials: { username, password },
      feeSection,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

async function generateDuesForStudent(student) {
  // find all fee sections applicable to student's department
  const feeSections = await FeeSection.find({
    applicableDepartments: student.department,
  });

  for (let fee of feeSections) {
    await Due.create({
      student: student._id,
      feeSection: fee._id,
      amount: 1000, // default (can change later)
    });
  }
}

exports.getStudentDues = async (req, res) => {
  try {
    const { admissionNo } = req.params;

    const student = await Student.findOne({ admissionNo });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const dues = await Due.find({ student: student._id }).populate(
      "feeSection",
      "name",
    );

    res.json(dues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllStudents = async (req, res) => {
  const students = await Student.find().populate("department", "name");
  res.json(students);
};

exports.deleteStudent = async (req, res) => {
  try {
    const { admissionNo } = req.body;

    const student = await Student.findOne({ admissionNo });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await Student.deleteOne({ admissionNo });
    await User.deleteOne({ username: admissionNo });
    await Due.deleteMany({ student: student._id });

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyDues = async (req, res) => {
  const dues = await Due.find({ student: req.user.refId }).populate(
    "feeSection",
    "name",
  );

  res.json(dues);
};

exports.getAdvisorDues = async (req, res) => {
  const dept = await Department.findOne({
    "advisors.faculty": req.user.refId,
  });

  const advisor = dept.advisors.find(
    (a) => a.faculty.toString() === req.user.refId.toString(),
  );

  const students = await Student.find({
    department: dept._id,
    className: advisor.className,
  });

  const ids = students.map((s) => s._id);

  const dues = await Due.find({ student: { $in: ids } }).populate(
    "feeSection",
    "name",
  );

  res.json(dues);
};

exports.getHodDues = async (req, res) => {
  try {
    const dept = await Department.findOne({ hod: req.user.refId });
    if (!dept) return res.status(404).json({ message: "Department not found" });

    const students = await Student.find({ department: dept._id });
    const ownIds = students.map((s) => s._id);

    const hodFeeSection = await FeeSection.findOne({ name: "HOD Fine" });

    const mongoose = require("mongoose");
    const refId = new mongoose.Types.ObjectId(req.user.refId); // ✅ cast to ObjectId

    const query = hodFeeSection
      ? {
          $or: [
            { student: { $in: ownIds } },
            {
              feeSection: hodFeeSection._id,
              addedByRef: refId  // ✅ now matches correctly
            }
          ]
        }
      : { student: { $in: ownIds } };

    const dues = await Due.find(query)
      .populate("feeSection", "name")
      .populate("student", "name admissionNo className");

    const result = dues.map((d) => ({
      ...d.toObject(),
      deptName: dept.name,
      addedByRef: d.addedByRef?.toString(), // ✅ send as string to frontend
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Returns unique students for HOD's department
exports.getHodStudents = async (req, res) => {
  try {
    const dept = await Department.findOne({ hod: req.user.refId });

    if (!dept) {
      return res.status(404).json({ message: "Department not found" });
    }

    const students = await Student.find({ department: dept._id }).populate(
      "department",
      "name",
    );

    res.json({ deptName: dept.name, students });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Returns per-student due breakdown grouped by fee-section type
exports.getHodDueSheet = async (req, res) => {
  try {
    const dept = await Department.findOne({ hod: req.user.refId });

    if (!dept) {
      return res.status(404).json({ message: "Department not found" });
    }

    const students = await Student.find({ department: dept._id });
    const ids = students.map((s) => s._id);

    const dues = await Due.find({ student: { $in: ids } })
      .populate("student", "name admissionNo className")
      .populate("feeSection", "name");

    // Group dues by student
    const studentMap = {};

    dues.forEach((due) => {
      const s = due.student;
      const key = s.admissionNo;

      if (!studentMap[key]) {
        studentMap[key] = {
          id: s.admissionNo,
          name: s.name,
          sem: s.className,
          dept: dept.name,
          tuition: 0,
          exam: 0,
          library: 0,
          bus: 0,
          fine: 0,
          total: 0,
          feeCategories: [],
        };
      }

      const feeName = due.feeSection?.name?.toLowerCase() || "";
      const amount = due.status === "pending" ? due.amount : 0;

      if (feeName.includes("tuition")) {
        studentMap[key].tuition += amount;
      } else if (feeName.includes("exam")) {
        studentMap[key].exam += amount;
      } else if (feeName.includes("library")) {
        studentMap[key].library += amount;
      } else if (feeName.includes("bus") || feeName.includes("transport")) {
        studentMap[key].bus += amount;
      } else if (
        feeName.includes("fine") ||
        feeName.includes("penalty") ||
        feeName.includes("damage")
      ) {
        studentMap[key].fine += amount;
      }

      if (due.status === "pending") {
        studentMap[key].total += amount;
      }

      studentMap[key].feeCategories.push({
        cat: due.feeSection?.name || "Fee",
        amount: `₹${due.amount.toLocaleString("en-IN")}`,
        due: due.updatedAt ? due.updatedAt.toISOString().split("T")[0] : "-",
        status: due.status === "paid" ? "Published" : "Pending",
        remark: "",
      });
    });

    const rows = Object.values(studentMap);

    // Build fee categories grouped by semester
    const feeBySem = {};
    rows.forEach((row) => {
      if (!feeBySem[row.sem]) feeBySem[row.sem] = {};
      row.feeCategories.forEach((fc) => {
        const catKey = fc.cat;
        if (!feeBySem[row.sem][catKey]) {
          feeBySem[row.sem][catKey] = { ...fc };
        }
      });
    });

    // Convert to array per semester
    const feeData = {};
    Object.keys(feeBySem).forEach((sem) => {
      feeData[sem] = Object.values(feeBySem[sem]);
    });

    res.json({ deptName: dept.name, rows, feeData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve or reject a pending fine
exports.approveFine = async (req, res) => {
  try {
    const { fineId, action } = req.body;

    const due = await Due.findById(fineId);
    if (!due) {
      return res.status(404).json({ message: "Fine not found" });
    }

    if (action === "approve") {
      due.status = "pending"; // approved and now visible as pending to student
    } else {
      await Due.findByIdAndDelete(fineId);
      return res.json({ message: "Fine rejected and removed" });
    }

    await due.save();
    res.json({ message: "Fine approved successfully", due });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFeeSectionDues = async (req, res) => {
  const dues = await Due.find({
    feeSection: req.user.refId,
  }).populate("student", "name admissionNo");

  res.json(dues);
};

exports.resetPassword = async (req, res) => {
  try {
    const { username, newPassword } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = newPassword; // will be hashed automatically
    await user.save();

    res.json({
      message: "Password reset successful",
      newPassword,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find().populate("department", "name");
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate(
      "hod",
      "name facultyId",
    );

    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteFaculty = async (req, res) => {
  try {
    //console.log("BODY to deleted: ",req.body);

    const { facultyId } = req.body;

    // find faculty
    const faculty = await Faculty.findOne({ facultyId });
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    // ❗ optional safety check (recommended)
    if (faculty.role === "HOD") {
      return res.status(400).json({
        message: "Cannot delete HOD. Remove HOD role first.",
      });
    }

    // delete related user login
    await User.deleteOne({
      refId: faculty._id,
      refModel: "Faculty",
    });

    // remove faculty from department advisors
    await Department.updateMany(
      { "advisors.faculty": faculty._id },
      { $pull: { advisors: { faculty: faculty._id } } },
    );

    // delete faculty
    await Faculty.deleteOne({ facultyId });

    res.json({ message: "Faculty deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { departmentId, name, activeClasses } = req.body;

    const dept = await Department.findById(departmentId);
    if (!dept) return res.status(404).json({ message: "Department not found" });

    if (name !== undefined) dept.name = name;
    if (activeClasses !== undefined) dept.activeClasses = activeClasses;

    await dept.save();
    res.json({ message: "Updated successfully", department: dept });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addFine = async (req, res) => {
  try {
    const fines = Array.isArray(req.body) ? req.body : [req.body];

    const results = [];

    for (const fine of fines) {
      const { admissionNo, amount, feeType, dueDate } = fine;

      // find student
      const student = await Student.findOne({ admissionNo });
      if (!student) {
        results.push({ admissionNo, error: "Student not found" });
        continue;
      }

      // find or create a "HOD Fine" fee section
      let feeSection = await FeeSection.findOne({ name: "HOD Fine" });
      if (!feeSection) {
        feeSection = await FeeSection.create({
          name: "HOD Fine",
          applicableDepartments: [],
          permissions: [],
        });
      }

      // create the due
      const due = await Due.create({
        student: student._id,
        feeSection: feeSection._id,
        amount,
        dueDate,
        status: "pending",
        remark: feeType,
        addedBy: "hod", // ✅ add
        addedByRef: req.user?.refId, // ✅ add — pass req to addFine
      });

      results.push({ admissionNo, due });
    }

    res.status(201).json({ message: "Fines added", results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteFine = async (req, res) => {
  try {
    const { fineId } = req.body;

    const due = await Due.findById(fineId);
    if (!due) return res.status(404).json({ message: "Fine not found" });

    if (due.addedBy !== "hod") {
      return res.status(403).json({ message: "You can only delete fines you added" });
    }

    // ✅ cast both to string for comparison
    if (due.addedByRef?.toString() !== req.user.refId?.toString()) {
      return res.status(403).json({ message: "You can only delete fines you added" });
    }

    await Due.findByIdAndDelete(fineId);
    res.json({ message: "Fine deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPrincipal = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // check already exists
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const principal = new User({
      username,
      password,   // will be hashed automatically
      role
    });

    await principal.save();

    res.status(201).json({
      message: `${role} created successfully`,
      credentials: {
        username,
        password
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { username, role } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.json({ message: "Role updated successfully", user });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Add these to adminController.js ──

// GET all fee sections (for admin page)
exports.getAllFeeSections = async (req, res) => {
  try {
    const sections = await FeeSection.find()
      .populate("applicableDepartments", "name");
    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE fee section (name, category, departments)
exports.updateFeeSection = async (req, res) => {
  try {
    const { feeSectionId, name, category, responsibleStaff, applicableDepartments } = req.body;

    const section = await FeeSection.findById(feeSectionId);
    if (!section) return res.status(404).json({ message: "Fee section not found" });

    if (name) section.name = name;
    if (category !== undefined) section.category = category;
    if (responsibleStaff !== undefined) section.responsibleStaff = responsibleStaff;
    if (applicableDepartments) section.applicableDepartments = applicableDepartments;

    await section.save();

    const populated = await FeeSection.findById(section._id)
      .populate("applicableDepartments", "name");

    res.json({ message: "Updated successfully", feeSection: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE fee section
exports.deleteFeeSectionById = async (req, res) => {
  try {
    const { feeSectionId } = req.body;

    const section = await FeeSection.findById(feeSectionId);
    if (!section) return res.status(404).json({ message: "Fee section not found" });

    // delete related user login
    await User.deleteOne({ refId: section._id, refModel: "FeeSection" });

    // delete the fee section
    await FeeSection.findByIdAndDelete(feeSectionId);

    res.json({ message: "Fee section deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};