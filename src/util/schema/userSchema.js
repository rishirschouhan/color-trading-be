const util = require("../util");
function UserSchema({ email = "", countryCode = "+91", phoneNumber = "", password = "", name = "", address = {} }) {
    this.email = email ? email : phoneNumber + "@gmail.com";
    this.countryCode = countryCode;
    this.phoneNumber = phoneNumber ? parseInt(phoneNumber) : "";
    // this.password = password ? util.generatPasswordeHash(password) : {};
    this.name = name;
    // this.address = address ?? {};

}

module.exports = { UserSchema }