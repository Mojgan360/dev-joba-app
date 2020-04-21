const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).json({ msg: "No teken! authurization denied." });
  }
  if (token) {
    try {
      const decode = jwt.verify(token, config.get("Jwt_Sceret"));

      req.user = decode.user;
      //console.log(`req-user ${req.user.id}`);

      next();
    } catch (err) {
      req.res.status(401).json({ msg: "token is not valid" });
    }
  }
};
