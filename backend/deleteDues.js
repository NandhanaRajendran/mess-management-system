const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: __dirname + "/.env" });

const Due = require("./models/Due");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("Connected to DB");
  const result = await Due.deleteMany({ amount: 1000 });
  console.log(`Deleted ${result.deletedCount} default 1000 rupees dues.`);
  process.exit(0);
}).catch(console.error);
