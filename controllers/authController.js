const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");
const Admin = require("../models/Admin");

// Predefined admin credentials
const predefinedAdmins = [
  { employeeId: 1200, password: "pass1" },
  { employeeId: 1400, password: "pass" },
];

// Employee Registration
exports.registerEmployee = async (req, res) => {
  const {
    name,
    email,
    password,
    employeeId,
    department,
    designation,
    mobileNo,
  } = req.body;

  try {
    let employee = await Employee.findOne({ email });
    if (employee) {
      return res
        .status(400)
        .json({ msg: "Employee with this email already exists" });
    }

    employee = await Employee.findOne({ employeeId });
    if (employee) {
      return res
        .status(400)
        .json({ msg: "Employee with this ID already exists" });
    }

    employee = new Employee({
      name,
      email,
      password,
      employeeId,
      department,
      designation,
      mobileNo,
      leaveRequests: [],
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
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token, employeeId: employee.employeeId });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Admin Login
exports.loginAdmin = async (req, res) => {
  const { employeeId, password } = req.body;
   console.log('Admin login attempt:', { employeeId, password });
  try {
    const admin = predefinedAdmins.find(admin => admin.employeeId === employeeId);
    if (!admin) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = password === admin.password;
    
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    console.log('Admin authentication successful');
    
    const payload = { 
      admin: { 
        id: admin.employeeId,
        role: 'admin'
      } 
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) {
          console.error('Token generation error:', err);
          throw err;
        }
        console.log('Token generated successfully');
        res.status(200).json({ 
          success: true,
          token, 
          employeeId: admin.employeeId,
          role: 'admin',
          msg: 'Admin login successful'
        });
      }
    );
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ msg: "Server Error" });
  }
};
