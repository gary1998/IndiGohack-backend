const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    unmr_pnr: {
      type: String,
      trim: true,
      required: true,
    },
    step_number: {
      type: Number,
      min: 1,
      max: 6,
      required: true,
    },
    step_status: {
      type: String,
      trim: true,
      enum: ["started", "in-progress", "completed", "failed"],
      required: true,
    },
    event_name: {
      type: String,
      trim: true,
      required: true,
    },
    time: {
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
