const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const FeeSection = require("./models/FeeSection");
const User = require("./models/User");
const Department = require("./models/Department");

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log("Connected to DB");
    
    let mess = await FeeSection.findOne({ name: "Mess" });
    if (!mess) {
        // Get all departments to assign
        const allDepts = await Department.find({});
        const deptIds = allDepts.map(d => d._id);

        mess = await FeeSection.create({
            name: "Mess",
            category: "Hostel",
            responsibleStaff: "Mess Manager",
            applicableDepartments: deptIds,
            permissions: { canAddFee: true, canViewDues: true },
            username: "MessManager",
            password: "1234",
        });

        await User.create({
            username: "MessManager",
            password: "1234",
            role: "feeManager",
            refId: mess._id,
            refModel: "FeeSection",
        });
        console.log("Mess Section seeded successfully");
    } else {
        console.log("Mess Section already exists");
    }
    process.exit(0);
}).catch(console.error);
