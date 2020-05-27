const express = require("express");
const request = require("request");
const axios = require("axios");

const router = express.Router();

const { check, validationResult } = require("express-validator");

const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const Post = require("../../models/Post");

// @route   Post api/posts
// @desc    Create or update user profile
// @access Pr, ivate
router.post(
  "/",
  [
    auth,
    [
      check("status", "status is required").not().isEmpty(),
      check("skills", "skills is required ").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    //build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    //Build social object

    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        //Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }
      profile = new Profile(profileFields);

      await profile.save();
      res.send(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }

    res.send("hello");
  }
);

// @route   GET api/profile/me
// @desc    Get current user profile
// @ access private

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);
    console.log(req.user.id);
    if (!profile) {
      return res
        .status(402)
        .json({ msg: " There is no profile for this user" });
    }
    res.json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Erorr.....");
  }
});

// @route    GET api/profile
// @desc     Get all profiles
// @access   Public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.err(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/profile/user/:user_id
// @desc     Get  profiles by user ID
// @access   Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) return res.status(400).json({ msg: "Profile not found" });
    res.json(profile);
  } catch (err) {
    if (err === "ObjectId") {
      return res.status(400).json({ msg: "Profile not found" });
    }
    console.error(err.message);
    res.status(500).send("Server Error...");
  }
});

// @route    DELETE api/profile
// @desc     Delete profile, user, and posts
// @access   Private
router.delete("/", auth, async (req, res) => {
  try {
    //Remove user posts
    await Post.deleteMany({ user: req.user.id });
    //Removes the profile
    await Profile.findOneAndRemove({ user: req.user.id });
    //Removes the user
    await User.findByIdAndRemove({ _id: req.user.id });
    res.json({ msg: "User removed." });
  } catch (err) {
    console.err(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    PUT /api/profile/experience
// @desc     Update profiles experiences..work history
// @access   Private
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required.").not().isEmpty(),
      check("company", "Company is required.").not().isEmpty(),
      check("from", "From date is required.").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    // Validate the input from the front end.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //if no errors, destructure the req.body to get the information that we want to update.
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    // create an object representing the new experiences
    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    // Use a try/catch block to update this new information in the database
    try {
      //Get the profile with the user.id
      const profile = await Profile.findOne({ user: req.user.id });
      // unshift addes our new information first
      profile.experience.unshift(newExp);
      // Save the new profile
      await profile.save();
      //Respond with the updated profile
      res.json(profile);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  }
);
// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete experience from profile
// @access   Private

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const foundProfile = await Profile.findOne({ user: req.user.id });

    foundProfile.experience = foundProfile.experience.filter(
      (exp) => exp._id.toString() !== req.params.exp_id
    );

    await foundProfile.save();
    return res.status(200).json(foundProfile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error" });
  }
});

// @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private
router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required").not().isEmpty(),
      check("degree", "Degree is required").not().isEmpty(),
      check("fieldofstudy", "Field of study is required").not().isEmpty(),
      check("from", "From date is required and needs to be from the past")
        .not()
        .isEmpty()
        .custom((value, { req }) => (req.body.to ? value < req.body.to : true)),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    DELETE api/profile/education/:edu_id
// @desc     Delete education from profile
// @access   Private

router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const foundProfile = await Profile.findOne({ user: req.user.id });
    foundProfile.education = foundProfile.education.filter(
      (edu) => edu._id.toString() !== req.params.edu_id
    );
    await foundProfile.save();
    return res.status(200).json(foundProfile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error" });
  }
});

// @route    GET api/profile/github/:username
// @desc     Get user repos from Github
// @access   Public
// @route    GET api/profile/github/:username
// @desc     Get user repos from Github
// @access   Public
router.get("/github/:username", (req, res) => {
  try {
    const options = {
      uri: encodeURI(
        `https://api.github.com/users/${
          req.params.username
        }/repos?per_page=5&sort=created:asc&client_id=${config.get(
          "githubClientId"
        )}&client_secret=${config.get("githubSecret")}`
      ),
      method: "GET",
      headers: { "user-agent": "node.js" },
    };

    request(options, (error, response, body) => {
      if (error) console.error(error);

      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: "No Github profile found" });
      }

      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
/*
router.get("/github/:username", async (req, res) => {
  try {
    const uri = encodeURI(
      `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
    );
    const headers = {
      "user-agent": "node.js",
      Authorization: `token ${config.get("githubToken")}`,
    };

    const gitHubResponse = await axios.get(uri, { headers });
    return res.json(gitHubResponse.data);
  } catch (err) {
    console.error(err.message);
    return res.status(404).json({ msg: "No Github profile found" });
  }
});*/

module.exports = router;

/*
try {
  // Using upsert option (creates new doc if no match is found):
  let profile = await Profile.findOneAndUpdate(
    //user from db
    //req.user.id: from token
    { user: req.user.id },
    { $set: profileFields },
    { new: true, upsert: true }
  );*/
