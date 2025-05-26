const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const checkAdminAuth = require("../middleware/checkAdminAuth");

// Route to view all leave requests
router.get("/leave-requests", checkAdminAuth, adminController.viewLeaveRequests);

// Route to approve or reject leave request
router.put("/update-leave-request", checkAdminAuth, adminController.updateLeaveRequest);

router.get("/hod-leave-requests", checkAdminAuth, adminController.getHodLeaveRequests);

router.put("/hod-update-leave-request", checkAdminAuth, adminController.updateHodLeaveRequest);


module.exports = router;
