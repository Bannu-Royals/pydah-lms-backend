const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const HOD = require("../models/Hod");
const Employee = require("../models/Employee");

// HOD Registration
exports.registerHod = async (req, res) => {
  try {
    const { name, email, password, department, HODId } = req.body;
    
    // Check if email already exists
    let hodWithEmail = await HOD.findOne({ email });
    if (hodWithEmail) {
      return res.status(400).json({ msg: "HOD already registered with this email" });
    }
    
    // Check if department already has an HOD
    let hodWithDepartment = await HOD.findOne({ department });
    if (hodWithDepartment) {
      return res.status(400).json({ 
        msg: "This department already has an HOD registered. Please login with those credentials." 
      });
    }
    
    // Check if HODId is already taken
    let hodWithId = await HOD.findOne({ HODId });
    if (hodWithId) {
      return res.status(400).json({ msg: "Invalid HOD ID. This ID is already registered." });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    hod = new HOD({
      name,
      email,
      password: hashedPassword,
      department,
      HODId,  // Using the HODId sent from frontend
    });
    
    await hod.save();
    res.status(201).json({ msg: "HOD registered successfully!" });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
// HOD Login
exports.loginHod = async (req, res) => {
  try {
    const { HODId, password } = req.body;
    const hod = await HOD.findOne({ HODId });

    if (!hod) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, hod.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const hodtoken = jwt.sign(
      { id: hod._id, department: hod.department },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ hodtoken, hod });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};


// Get HOD Details
exports.getHodDetails = async (req, res) => {
  try {
    const hod = await HOD.findById(req.hod.id).select("-password");
    if (!hod) {
      return res.status(404).json({ msg: "HOD not found" });
    }
    res.json(hod);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// Get Leave Requests of Department Faculty
exports.getDepartmentLeaves = async (req, res) => {
  try {
    const employees = await Employee.find({ department: req.hod.department }).select("name employeeId designation leaveRequests");
    const departmentLeaves = employees.flatMap(emp => 
      emp.leaveRequests.map(leave => ({
        employeeId: emp._id,
        ID: emp.employeeId,
        employeeName: emp.name,
        employeeDesignation: emp.designation,
        ...leave.toObject()
      }))
    );
    res.json(departmentLeaves);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// Update Leave Request Status with Remarks
// Update Employee Leave Request Status with Remarks
exports.updateLeaveRequest = async (req, res) => {
  try {
    const { hodId, leaveId, status, remarks } = req.body;
    employeeId = hodId;

    const employee = await Employee.findById({ employeeId, "_id": employeeId });
    if (!employee) return res.status(404).json({ msg: "Employee not found" });

    const leaveRequest = employee.leaveRequests.id(leaveId);
    if (!leaveRequest) return res.status(404).json({ msg: "Leave request not found" });

    leaveRequest.status = status;
    leaveRequest.remarks = remarks;

    await employee.save();
    res.json({ msg: "Employee leave request updated", leaveRequest });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};



exports.applyHodLeave = async (req, res) => {
  try {
    const { hodId, leaveType, startDate, endDate, reason, alternateSchedule } = req.body;

    // Ensure required fields are present
    if (!hodId) return res.status(400).json({ msg: "HOD ID is required" });
    if (!leaveType) return res.status(400).json({ msg: "Leave type is required" });
    if (!startDate || !endDate) return res.status(400).json({ msg: "Start and end dates are required" });
    if (!reason) return res.status(400).json({ msg: "Reason is required" });
    if (!Array.isArray(alternateSchedule) || alternateSchedule.length !== 7) {
      return res.status(400).json({ msg: "Alternate schedule must include exactly 7 periods" });
    }

    // Fetch HOD details
    const hod = await HOD.findById(hodId);
    if (!hod) return res.status(404).json({ msg: "HOD not found" });

    // Convert and format dates (store only YYYY-MM-DD)
    const formattedStartDate = new Date(startDate).toISOString().split("T")[0];
    const formattedEndDate = new Date(endDate).toISOString().split("T")[0];

    // Validate date range
    if (new Date(formattedStartDate) > new Date(formattedEndDate)) {
      return res.status(400).json({ msg: "Start date cannot be after end date" });
    }

    // Check for overlapping leave requests
    const isOverlapping = hod.hodLeaveRequests.some(leave =>
      (new Date(formattedStartDate) <= new Date(leave.endDate) &&
       new Date(formattedEndDate) >= new Date(leave.startDate))
    );

    if (isOverlapping) {
      return res.status(400).json({ msg: "Leave request overlaps with an existing leave" });
    }

    // Calculate leave days
    const leaveDays = Math.ceil(
      (new Date(formattedEndDate) - new Date(formattedStartDate)) / (1000 * 60 * 60 * 24)
    ) + 1;

    let warningMessage = null;

    // Check if leave balance is sufficient
    if (hod.leaveBalance < leaveDays) {
      warningMessage = "Warning: Insufficient leave balance, but the request is still submitted.";
    }

    // Create leave request
    const leaveRequest = {
      leaveType,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      reason,
      status: "Pending",
      alternateSchedule
    };

    hod.hodLeaveRequests.push(leaveRequest);
    await hod.save();

    res.status(201).json({ 
      msg: "Leave request submitted successfully!", 
      leaveRequest, 
      warning: warningMessage // Send warning if applicable
    });

  } catch (error) {
    console.error("Leave Application Error:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Update HOD Leave Request Status with Remarks
exports.updateHodLeaveRequest = async (req, res) => {
  try {
    const {hodId, leaveId, status, remarks } = req.body;

    const hod = await HOD.findById(hodId);
    if (!hod) return res.status(404).json({ msg: "HOD not found" });

    const leaveRequest = hod.hodLeaveRequests.id(leaveId);
    if (!leaveRequest) return res.status(404).json({ msg: "HOD leave request not found" });
    

    // Calculate number of leave days
    const leaveDays =
      Math.ceil((new Date(leaveRequest.endDate) - new Date(leaveRequest.startDate)) / (1000 * 60 * 60 * 24)) + 1;

    let warningMessage = null;

    // If approving leave, check leave balance
    if (status === "Approved") {
      if (hod.leaveBalance < leaveDays) {
        warningMessage = "Warning: Insufficient leave balance, but the request is still approved.";
        hod.leaveBalance -= leaveDays;
      } else {
        hod.leaveBalance -= leaveDays; // Deduct leave days only if balance is sufficient
      }
    }

    leaveRequest.status = status;
    leaveRequest.remarks = remarks;

    await hod.save();
    res.json({ 
      msg: "HOD leave request updated", 
      leaveRequest, 
      leaveBalance: hod.leaveBalance, 
      warning: warningMessage // Send warning message if applicable
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
