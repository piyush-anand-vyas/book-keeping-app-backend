const express = require("express");
const router = express.Router();
const CustomerBalance = require("../models/CustomerBalance");
const Customer = require("../models/Customer");
const fetchUser = require("../middleware/fetchUser");
const fetchCustomer = require("../middleware/fetchCustomer");

router.get("/getCustomerBalances", fetchUser, fetchCustomer, async (req, res) => {
    try {
      let customerBalance = await CustomerBalance.findOne({ customer: req.customer });
      if (!customerBalance) {
        return res.json({ message: "No customer balance found" });
      }
      res.send(customerBalance);
    } catch (error) {
      res.json({ error: "Internal Server Error" });
    }
  });

  router.get("/user/getCustomerBalances", fetchUser, async (req, res) => {
    try {
      let customers = await Customer.find({ user: req.user.id });
      if (!customers) {
        return res.json({ message: "No customers found" });
      }
      let customerBalances = await CustomerBalance.find({ customer: {$in: customers} });
      if (!customerBalances) {
        return res.json({ message: "No customer balance found" });
      }
      res.send(customerBalances);
    } catch (error) {
      res.json({ error: "Internal Server Error" });
    }
  });

module.exports = router;