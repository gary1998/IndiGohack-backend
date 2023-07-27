const mongoose = require("mongoose");
const validator = require("validator");

const staffSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      trim: true,
      required: true,
      validate: (value) => {
        return validator.isEmail(value);
      },
    },
    name: { type: String, required: true },
    phone: {
      type: Number,
      unique: true,
      required: true,
      minLength: 10,
      maxLength: 10,
    },
    password: { type: String, required: true },
    token: { type: String },
  },
  {
    collection: "staff",
  }
);

module.exports = mongoose.model("staff", staffSchema);
