const express = require("express");
const router = express.Router();

const { 
    createStudent, 
    clearDatabase, 
    addFaculty, 
    createDepartment, 
    assignAdvisor, 
    createFeeSection, 
    getStudentDues, 
    getAllStudents, 
    deleteStudent, 
    getMyDues,
    getAdvisorDues,
    getHodDues,
    getHodStudents,
    getHodDueSheet,
    approveFine,
    getFeeSectionDues,
    resetPassword,
    getAllFaculty,
    getAllDepartments,
    assignHod,
    deleteFaculty, 
    updateDepartment,
    addFine,
    deleteFine,
    createPrincipal,
    updateUserRole, } = require("../controllers/adminController");

const auth = require("../middleware/auth");

const Department = require("../models/Department");
router.get("/departments",async(req,res) => {
  try{
    const departments = await Department.find();
    res.json(departments);

  }catch (err) {
    res.status(500).json({error:err.message});
  }
});

router.delete("/clear", clearDatabase);
router.post("/add-student", createStudent);
router.post("/add-faculty", addFaculty);
router.post("/add-department", createDepartment);
router.post("/assign-advisor", assignAdvisor);
router.post("/create-fee-section", createFeeSection);
router.get("/student-dues/:admissionNo", getStudentDues);
router.get("/all-students", getAllStudents);
router.delete("/delete-student", deleteStudent);
router.get("/my-dues", auth, getMyDues);
router.get("/advisor-dues", auth, getAdvisorDues);
router.get("/hod-dues", auth, getHodDues);
router.get("/hod-students", auth, getHodStudents);
router.get("/hod-due-sheet", auth, getHodDueSheet);
router.post("/approve-fine", auth, approveFine);
router.get("/fee-dues", auth, getFeeSectionDues);
router.put("/reset-password", resetPassword);
router.get("/faculty",getAllFaculty);
router.get("/departments",getAllDepartments);
router.post("/assign-hod",assignHod);
router.post("/delete-faculty",deleteFaculty);
router.post("/update-department",updateDepartment);
router.post("/add-fine", auth, addFine);
router.delete("/delete-fine", auth, deleteFine);
router.post("/create-principal",createPrincipal);
router.put("/update-role",updateUserRole);


module.exports = router;