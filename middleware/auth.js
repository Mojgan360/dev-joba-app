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
      /* decode: 
      {
         user: { id: '5ec5255e713e512c3120088f' },
          iat: 1591307794,
           exp: 1594907794
         
      }
   */

      req.user = decode.user; // id: '5ec5255e713e512c3120088f'

      next();
    } catch (err) {
      req.res.status(401).json({ msg: "token is not valid" });
    }
  }
};
