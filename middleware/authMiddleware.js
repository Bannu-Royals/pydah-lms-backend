const jwt = require("jsonwebtoken");

exports.authEmployee = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Extract Bearer token

  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.employee = decoded.employee;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

exports.authHOD = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Extract Bearer token

  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.hod = decoded; // Corrected to store decoded data properly
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};


exports.authAdmin = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Extract Bearer token

  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded.admin;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
