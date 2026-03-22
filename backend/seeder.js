const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Student = require("./models/Student");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const Department = require("./models/Department");

dotenv.config({ path: "./.env" });
connectDB();

const roomsData = {
  1101: [{ name: "Anjana" }, { name: "Devika" }, { name: "Sreya" }],
  1102: [{ name: "Megha" }, { name: "Lakshmi" }],
  1103: [
    { name: "Athulya Babu" },
    { name: "Aswathy A" },
    { name: "Nandhana" },
    { name: "Tiyana" },
  ],
  1104: [{ name: "Arya" }, { name: "Gayathri" }],
  1105: [{ name: "Meera" }, { name: "Sneha" }, { name: "Diya" }],
  1106: [{ name: "Anu" }, { name: "Reshma" }],
  1107: [{ name: "Krishna" }, { name: "Gopika" }],
  1108: [{ name: "Aiswarya" }, { name: "Sandra" }],
  1109: [{ name: "Nimisha" }, { name: "Fathima" }],
  1110: [{ name: "Maria" }, { name: "Helen" }],
  1111: [{ name: "Anagha" }, { name: "Bhavana" }],
  1112: [{ name: "Keerthana" }, { name: "Neha" }],
  1113: [{ name: "Amrutha" }, { name: "Nitya" }],
  1114: [{ name: "Divya" }, { name: "Swathi" }],
};

const importData = async () => {
  try {
    // 🔥 CLEAR OLD STUDENTS
    await Student.deleteMany();

    // 🔥 FORCE DELETE OLD ADMIN
    await User.deleteMany({});

   // console.log("Seeder DB: ",process.env.MONGO_URI);
    

    // 🔐 CREATE ADMIN
    // const hashed = await bcrypt.hash("1234", 10);
    // console.log("Generated hash: ",hashed);
    

    const created = await User.create({
      username: "admin",
      password: "1234",
      role: "admin",
    });

    // (console.log"Admin recreated ✅");
    // console.log("Saved user: ",created);
    
   // const test = await bcrypt.compare("1234", hashed);
   // console.log("Manual test:", test);
    // 🔥 GET OR CREATE DEPARTMENT
    let dept = await Department.findOne({ name: "CSE" });

    if (!dept) {
      dept = await Department.create({ name: "CSE" });
      //console.log("Department created ✅");
    }

    const deptId = dept._id;

    // 👇 CREATE STUDENTS
    const students = [];

    let counter = 1001; // for unique admission numbers

    for (const [roomNumber, members] of Object.entries(roomsData)) {
      for (const member of members) {
        students.push({
          name: member.name,
          admissionNo: counter.toString(), // ✅ unique numeric string
          email:
            member.name.replace(/\s+/g, "").toLowerCase() + "@gmail.com",
          className: "S6",
          department: deptId, // ✅ ObjectId
          room: roomNumber,
          attendanceRecords: {},
          messCutRecords: {},
        });

        counter++;
      }
    }

    await Student.insertMany(students);

    //console.log("Students Imported ✅");

    //console.log(await bcrypt.compare("1234", created.password));

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

importData();