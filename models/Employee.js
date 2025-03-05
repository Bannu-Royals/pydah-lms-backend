const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  employeeId: { type: Number, unique: true, required: true },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  mobileNo: { type: String, required: true },
  leaveBalance: { type: Number, default: 12 }, // Start with 12 leaves per year
  leaveRequests: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Unique leave request ID
      leaveType: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      reason: { type: String, required: true },
      status: { 
        type: String, 
        enum: ["Pending", "Forwarded by HOD", "Approved", "Rejected"], 
        default: "Pending" 
      },
      remarks: { type: String, default: "" },
      alternateSchedule: [
        { periodNumber: Number, lecturerName: String, classAssigned: String }
      ]
    }
  ]
});



module.exports = mongoose.model("Employee", EmployeeSchema);
