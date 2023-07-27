const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    unmr_pnr: {
      type: String,
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
    staff_email: {
      type: String,
      trim: true,
      required: true,
    },
  },
  {
    collection: "event",
  }
);

module.exports = mongoose.model("event", eventSchema);
