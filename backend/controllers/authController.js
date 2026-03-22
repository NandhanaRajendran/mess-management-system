const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: "Invalid username" });
    }
    const cleanPassword = String(password).trim();

    // console.log("Req.body: ", req.body);

    // console.log("Login DB: ", process.env.MONGO_URI);

    // console.log("Entered username:", username);
    // console.log("Entered password:", password);
    // console.log("User found:", user);

    // console.log("Stored password:", user.password);

    // console.log("Type of password: ", typeof password);
    // console.log("Type of password: ", typeof user.password);

    const isMatch = await bcrypt.compare(cleanPassword, user.password);
    //console.log("Match result:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // 🔐 CREATE TOKEN
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        refId: user.refId,
      },
      process.env.JWT_SECRET, // later move to .env
      { expiresIn: "1d" },
    );

   // console.log("JWT: ",process.env.JWT_SECRET);
    

    let profile = null;

    // 🎓 If student
    if (user.role === "student") {
      profile = await Student.findById(user.refId).select(
        "name admissionNo className",
      );
    }

    // 👨‍🏫 If faculty (HOD / advisor)
    if (user.role === "hod" || user.role === "staffAdvisor") {
      profile = await Faculty.findById(user.refId).select("name facultyId");
    }

    

    res.json({
      message: "Login successful",
      token,
      user: {
        username: user.username,
        role: user.role,
        profile, // ✅ send profile data
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

