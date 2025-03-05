const Employee = require("../models/Employee");

// Get Employee Details by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    if (isNaN(employeeId)) return res.status(400).json({ msg: "Invalid employee ID" });

    const employee = await Employee.findOne({ employeeId }).select("-password"); // Exclude password
    if (!employee) return res.status(404).json({ msg: "Employee not found" });

    res.json(employee);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Update Employee Details
exports.updateEmployee = async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    if (isNaN(employeeId)) return res.status(400).json({ msg: "Invalid employee ID" });

    const updatedEmployee = await Employee.findOneAndUpdate({ employeeId }, req.body, { new: true });
    if (!updatedEmployee) return res.status(404).json({ msg: "Employee not found" });

    res.json({ msg: "Employee updated successfully", updatedEmployee });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Delete Employee
exports.deleteEmployee = async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    if (isNaN(employeeId)) return res.status(400).json({ msg: "Invalid employee ID" });

    const deletedEmployee = await Employee.findOneAndDelete({ employeeId });
    if (!deletedEmployee) return res.status(404).json({ msg: "Employee not found" });

    res.json({ msg: "Employee deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Add Leave Request
exports.addLeaveRequest = async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    if (isNaN(employeeId)) return res.status(400).json({ msg: "Invalid employee ID" });

    const employee = await Employee.findOne({ employeeId });
    console.log("employee", employee);
    if (!employee) return res.status(404).json({ msg: "Employee not found" });

    const { leaveType, startDate, endDate, reason, remarks, alternateSchedule } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ msg: "All required fields must be filled" });
    }

    const formattedStartDate = new Date(startDate);
    const formattedEndDate = new Date(endDate);
    formattedStartDate.setHours(0, 0, 0, 0);
    formattedEndDate.setHours(0, 0, 0, 0);

    if (isNaN(formattedStartDate.getTime()) || isNaN(formattedEndDate.getTime())) {
      return res.status(400).json({ msg: "Invalid dates provided" });
    }

    const formattedSchedule = (alternateSchedule || []).map((entry) => ({
      periodNumber: entry.periodNumber,
      lecturerName: entry.lecturerName || "",
      classAssigned: entry.classAssigned || "",
    }));

    const newLeaveRequest = {
      leaveType,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      reason,
      status: "Pending",
      remarks: remarks || "",
      alternateSchedule: formattedSchedule,
    };

    employee.leaveRequests.push(newLeaveRequest);
    await employee.save();

    res.json({
      msg: "Leave request submitted successfully",
      leaveRequests: employee.leaveRequests,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Update Leave Request Status
exports.updateLeaveRequestStatus = async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    if (isNaN(employeeId)) return res.status(400).json({ msg: "Invalid employee ID" });

    const employee = await Employee.findOne({ HODId: hodId,});
    if (!employee) return res.status(404).json({ msg: "Employee not found" });

    const leaveRequest = employee.leaveRequests.find(lr => lr._id.toString() === req.params.leaveRequestId);
    if (!leaveRequest) return res.status(404).json({ msg: "Leave request not found" });

    const validStatuses = ["Pending", "Forwarded by HOD", "Approved", "Rejected"];
    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({ msg: "Invalid status value" });
    }

    leaveRequest.status = req.body.status;
    await employee.save();

    res.json({ msg: "Leave request status updated", leaveRequests: employee.leaveRequests });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
