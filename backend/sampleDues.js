const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Due = require("./models/Due");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const dues = await Due.find({}).limit(10).populate("addedByRef");
  console.log(JSON.stringify(dues, null, 2));
  process.exit(0);
}).catch(console.error);
