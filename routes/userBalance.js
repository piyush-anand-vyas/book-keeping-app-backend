const express = require("express");
const router = express.Router();
const UserBalance = require("../models/UserBalance");
const fetchUser = require("../middleware/fetchUser");

router.get("/getUserBalance", fetchUser, async (req, res) => {
    try {
      let userBalance = await UserBalance.findOne({ user: req.user.id });
      if (!userBalance) {
        return res.json({ message: "No user balance found" });
      }
      res.send(userBalance);
    } catch (error) {
      res.json({ error: "Internal Server Error" });
    }
  });

module.exports = router;