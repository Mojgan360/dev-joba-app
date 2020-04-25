const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const gravatar = require("gravatar");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

// @route   GET api/user
// @desc    register user / sign up
// @ access public

//info:  //https://express-validator.github.io/docs/#basic-guide
router.post(
  "/",
  [
    check("name", "Name is required.").not().isEmpty(),
    check("email", "Please include a valid email.").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters."
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      //user exist
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exist." }] });
      }
      //add gravator
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });
      //user NOT exits
      user = new User({
        name,
        email,
        avatar,
        password,
      });
      //encrypt password
      const salt = await bcrypt.genSalt(10);
      // hash password
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      //res.send("user registered");

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

module.exports = router;
