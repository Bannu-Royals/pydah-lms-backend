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

// Auto-increment HOD ID
HODSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  const lastHod = await mongoose.model("Hod").findOne().sort({ HODId: -1 });
  this.HODId = lastHod ? lastHod.HODId + 1 : 1001; // Start from 1001

  next();
});

module.exports = mongoose.model("Hod", HODSchema);
