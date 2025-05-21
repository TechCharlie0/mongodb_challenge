const mongoose = require("mongoose");

main()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Connection Error:", err);
  });

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/test");
  // If auth enabled, use:
  // await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');
}
