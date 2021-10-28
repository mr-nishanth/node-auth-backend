const mongoose = require("mongoose");
const { MONGO_URI } = process.env;

const connectDB = async () => {
  // Connecting to the database
  await mongoose
    .connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
      console.log("Successfully connected to database");
};
module.exports = connectDB;