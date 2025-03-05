const express = require("express");
const { registerHod, loginHod, getHodDetails, getDepartmentLeaves, updateLeaveRequest, applyHodLeave,updateHodLeaveRequest } = require("../controllers/hodController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// HOD Registration
router.post("/hod-register", registerHod);

// HOD Login
router.post("/hod-login", loginHod);

// Get HOD Details (Protected)
router.get("/me", authMiddleware.authHOD, getHodDetails);

// Get Leave Requests of Faculty in HOD's Department (Protected)
router.get("/leaves", authMiddleware.authHOD, getDepartmentLeaves);

// Update Leave Status (Forward/Reject) (Protected)
router.put("/update-leave", authMiddleware.authHOD, updateLeaveRequest);

// Route for HOD applying for leave
router.post("/apply-leave",authMiddleware.authHOD, applyHodLeave);
// New route for updating HOD leave requests
router.put("/update-hod-leave",authMiddleware.authHOD, updateHodLeaveRequest);

module.exports = router;
