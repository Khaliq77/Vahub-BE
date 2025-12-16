const crypto = require("crypto");

const generatePassword = () => {
  return crypto.randomBytes(5).toString("hex"); // 10 karakter
};

module.exports = generatePassword;