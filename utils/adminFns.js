const AdminModel = require("../models/Admin");
const { hashPassword } = require("./auth"); // Import the hashPassword function from auth.js

async function createAdmin(name, username, password) {
  try {
    const { hashedPassword, salt } = await hashPassword(password);

    // Create a new instance of the AdminModel
    const newAdmin = new AdminModel({
      name,
      username,
      password: hashedPassword,
      salt,
    });

    // Save the new admin to the database
    const savedAdmin = await newAdmin.save();

    console.log(
      `Admin with username '${savedAdmin.username}' created successfully.`
    );
    return savedAdmin;
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error creating admin:", error.message);
    throw error;
  }
}

module.exports = createAdmin;
