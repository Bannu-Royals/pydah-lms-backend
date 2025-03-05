const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController.js");
const authMiddleware = require("../middleware/authMiddleware");  // Assuming you have an auth middleware to validate JWT



// Get Employee Details by ID
router.get("/:id", authMiddleware.authEmployee, employeeController.getEmployeeById);

// Update Employee Details
router.put("/:id", authMiddleware.authEmployee, employeeController.updateEmployee);

// Delete Employee
router.delete("/:id", authMiddleware.authEmployee, employeeController.deleteEmployee);

// Add Leave Request
router.post("/:id/leave-request", authMiddleware.authEmployee, employeeController.addLeaveRequest);

// Update Leave Request Status
router.put("/:id/leave-request/:leaveRequestId", authMiddleware.authEmployee, employeeController.updateLeaveRequestStatus);

module.exports = router;
