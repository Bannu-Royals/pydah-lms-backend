
const express = require("express");
const router = express.Router();
const { registerEmployee, loginEmployee, loginAdmin } = require("../controllers/authController");

router.post("/register", registerEmployee);
router.post("/login/employee", loginEmployee);
router.post("/admin", loginAdmin);

module.exports = router;
