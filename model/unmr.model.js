const mongoose = require("mongoose");

const unmrSchema = new mongoose.Schema(
  {
    pnr: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    source: {
      type: String,
      trim: true,
      required: true,
    },
    destination: {
      type: String,
      trim: true,
      required: true,
    },
    receiver_name: { type: String, trim: true, required: true },
    receiver_phone: {
      type: String,
      trim: true,
      required: true,
      minLength: 10,
      maxLength: 10,
    },
  },
  {
    collection: "unmr",
  }
);

module.exports = mongoose.model("unmr", unmrSchema);