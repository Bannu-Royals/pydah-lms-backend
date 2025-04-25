const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");
const Admin = require("../models/Admin");

// Predefined admin credentials
const predefinedAdmins = [
  { email: "admin1@gmail.com", password: "pass1" },
  { email: "admin2@gmail.com", password: "securepass2" }
];

// Employee Registration
exports.registerEmployee = async (req, res) => {
  const { name, email, password, employeeId, department, designation, mobileNo } = req.body;
  
  try {
    let employee = await Employee.findOne({ email });
    if (employee) return res.status(400).json({ msg: "Employee with this email already exists" });

    employee = await Employee.findOne({ employeeId });
    if (employee) return res.status(400).json({ msg: "Employee with this ID already exists" });

    employee = new Employee({
      name,
      email,
      password,
      employeeId,
      department,
      designation,
      mobileNo,
      leaveRequests: []
    });

    const salt = await bcrypt.genSalt(10);
    employee.password = await bcrypt.hash(password, salt);
    await employee.save();

    res.status(201).json({ msg: "Employee registered successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Employee Login
exports.loginEmployee = async (req, res) => {
  const { employeeId, password } = req.body;
  try {
    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const payload = { employee: { id: parseInt(employee.employeeId) } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
      if (err) throw err;
      res.json({ token, employeeId: employee.employeeId });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Admin Login using Email
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = predefinedAdmins.find(admin => admin.email === email);
    if (!admin) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = password === admin.password;
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const payload = { admin: { email } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
      if (err) throw err;
      res.json({ token, email });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
