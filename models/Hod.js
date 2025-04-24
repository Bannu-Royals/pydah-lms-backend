const mongoose = require("mongoose");

const HODSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  department: { type: String, unique: true, required: true }, // One HOD per department
  HODId: { type: Number, unique: true, required: true }, 
  leaveBalance: { type: Number, default: 12 }, // Start with 12 leaves per year
  hodLeaveRequests: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Unique leave request ID
      leaveType: { type: String, required: true },
      startDate: Date,
      endDate: Date,
      reason: String,
      status: { type: String, default: "Pending" },
      alternateSchedule: [
        { periodNumber: Number, lecturerName: String, classAssigned: String }
      ]
    }
  ]
});

module.exports = mongoose.model("Hod", HODSchema);
