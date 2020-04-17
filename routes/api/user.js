const express = require("express");
const router = express.Router();

// @route   GET api/user
// @desc    test route
// @ access public

router.get("/", (req, res) => {
  res.send("hello from user route");
});

module.exports = router;
