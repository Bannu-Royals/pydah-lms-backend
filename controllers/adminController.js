const Employee = require("../models/Employee");
const Hod = require("../models/Hod");

// View all leave requests (Admin can see all Employee & HOD requests)
exports.viewLeaveRequests = async (req, res) => {
  try {
    const employees = await Employee.find({}, "name employeeId department leaveRequests");

    const allLeaveRequests = employees.flatMap((employee) => 
      employee.leaveRequests
        .filter((leaveRequest) => leaveRequest.status !== "Pending") // Exclude pending requests
        .map((leaveRequest) => ({
          employeeId: employee.employeeId,
          name: employee.name,
          department: employee.department,
          leaveRequest,
        }))
    );

    console.log("Fetched Employee Leave Requests:", allLeaveRequests);

    res.status(200).json({ success: true, leaveRequests: allLeaveRequests });
  } catch (err) {
    console.error("Error fetching employee leave requests:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Approve or Reject Employee Leave Request
exports.updateLeaveRequest = async (req, res) => {
  try {
    const { employeeId, leaveRequestId, status, remarks } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const employee = await Employee.findOne({ employeeId });

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const leaveRequest = employee.leaveRequests.id(leaveRequestId);
    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: "Leave request not found" });
    }

    // Calculate number of leave days
    const leaveDays =
      Math.ceil((new Date(leaveRequest.endDate) - new Date(leaveRequest.startDate)) / (1000 * 60 * 60 * 24)) + 1;

    let warningMessage = null;
    // Handle Leave Approval Logic
 
    if (status === "Approved") {
      if (employee.leaveBalance < leaveDays) {
        warningMessage = "Warning: Insufficient leave balance, but the request is still approved.";
        employee.leaveBalance -= leaveDays;
      } else {
        employee.leaveBalance -= leaveDays; // Deduct leave days only if balance is sufficient
      }
    }

    leaveRequest.status = status;
    leaveRequest.remarks = remarks || leaveRequest.remarks; // Update remarks only if provided

    await employee.save();

    console.log("Updated Employee Leave Request:", leaveRequest);
    res.status(200).json({ success: true, message: "Leave request updated successfully",warning: warningMessage  });
  } catch (err) {
    console.error("Error updating employee leave request:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


// Fetch HOD Leave Requests
exports.getHodLeaveRequests = async (req, res) => {
  try {
    const hods = await Hod.find({}, "name HODId department hodLeaveRequests");

    const allHodLeaveRequests = hods.flatMap((hod) => 
      hod.hodLeaveRequests.map((leaveRequest) => ({
        hodName: hod.name,
        hodId: hod.HODId,
        department: hod.department,
        leaveRequest,
      }))
    );

    
    res.status(200).json({ success: true, leaveRequests: allHodLeaveRequests });
  } catch (error) {
    console.error("Error fetching HOD leave requests:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Approve or Reject HOD Leave Request
exports.updateHodLeaveRequest = async (req, res) => {
  try {
    const { employeeId, leaveRequestId, status, remarks } = req.body;
    hodId = employeeId;
    var static = "Rejected by Principal";
   

 
    if (!["Approved", "Rejected"].includes(status)) {
    
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const hod = await Hod.findOne({ HODId: hodId, "hodLeaveRequests._id": leaveRequestId });
    console.log("hod:",hod);
    if (!hod) {
      console.log(hod);
      return res.status(404).json({ success: false, message: "HOD leave request not found" });
    }

    const leaveRequest = hod.hodLeaveRequests.id(leaveRequestId);

      // Calculate number of leave days
    const leaveDays =
    Math.ceil((new Date(leaveRequest.endDate) - new Date(leaveRequest.startDate)) / (1000 * 60 * 60 * 24)) + 1;

  let warningMessage = null;

  // If approving leave, check leave balance
  if (status === "Approved") {
    static = "Approved by Principal";
    if (hod.leaveBalance < leaveDays) {
      warningMessage = "Warning: Insufficient leave balance, but the request is still approved.";
      hod.leaveBalance -= leaveDays;
    } else {
      hod.leaveBalance -= leaveDays; // Deduct leave days only if balance is sufficient
    }
  }
      
    
    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: "Leave request not found" });
    }

    leaveRequest.status = status;
    leaveRequest.remarks = remarks || static; // Update only if provided

    await hod.save();

    
    res.status(200).json({ success: true, message: "Leave request updated successfully" , warning: warningMessage });
  } catch (error) {
    console.error("Error updating HOD leave request:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
