const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Route to view all leave requests
router.get("/leave-requests", adminController.viewLeaveRequests);

// Route to approve or reject leave request
router.put("/update-leave-request", adminController.updateLeaveRequest);

router.get("/hod-leave-requests",  adminController.getHodLeaveRequests);

router.put("/hod-update-leave-request", adminController.updateHodLeaveRequest);


module.exports = router;
