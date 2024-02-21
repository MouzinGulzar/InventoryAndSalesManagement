const params = require("../utils/params");
const { hashPassword } = require("../utils/auth");
const AdminModel = require("../models/Admin");

const createAdmin = require("../utils/adminFns");

exports.getLogin = (req, res, next) => {
  // createAdmin("Faisal Syed", "FaisalSyed", "5tr0n9P@55w0rd");
  if (req.session.user) res.redirect("/");
  else res.render("login", params("Login", "/login"));
};

exports.postLogin = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    // Validate if username and password are provided
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Both username and password are required." });
    }

    // Check if the user with the provided username exists
    const user = await AdminModel.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Hash the provided password and compare it with the stored hashed password
    const { password: hashedPassword, salt } = user;
    const { hashedPassword: inputHashedPassword } = await hashPassword(
      password,
      salt
    );

    if (hashedPassword !== inputHashedPassword) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Initialize the session with the user's information
    req.session.user = user;

    return res.redirect("/");
  } catch (error) {
    console.error("Error during login:", error.message);
    return res.status(500).json({ error: "Internal server error." });
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Error during logout:", error.message);
      return res.status(500).json({ error: "Internal server error." });
    }

    return res.redirect("/login");
  });
};
