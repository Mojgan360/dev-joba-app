const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

// @route   GET api/auth
// @desc    test route
// @ access public

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    console.log(req.user.id);
    return res.json({ user });
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error!");
  }
});

//=========

// @route   Post api/user
// @desc    autorization user, login
// @ access public

//info:  //https://express-validator.github.io/docs/#basic-guide
router.post(
  "/",
  [
    check("email", "Please include a valid email.").isEmail(),
    check("password", "Password is required.").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    //--*--
    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      //--*--
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials." }] });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials." }] });
      }

      //add jsonwebtokeb
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("Jwt_Sceret"),
        { expiresIn: 3600000 },
        (err, token) => {
          if (err) throw err;

          return res.json({ token });
        }
      );

      //res.send("hello from user route");
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ errors: "Server error" });
    }
  }
);

//_______

module.exports = router;
