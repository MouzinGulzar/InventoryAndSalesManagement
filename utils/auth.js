const { pbkdf2, randomBytes } = require("crypto");

// Function to hash a password
const hashPassword = (password, salt) => {
  return new Promise((resolve, reject) => {
    // Generate a random salt if not provided
    if (!salt) {
      salt = randomBytes(16).toString("hex");
    }

    // Hash the password with SHA-256
    pbkdf2(password, salt, 10000, 64, "sha256", (err, derivedKey) => {
      if (err) {
        reject(err);
      } else {
        // Convert the derived key to hexadecimal string
        const hashedPassword = derivedKey.toString("hex");

        // Resolve with the hashed password and salt
        resolve({ hashedPassword, salt });
      }
    });
  });
};

module.exports = { hashPassword };
