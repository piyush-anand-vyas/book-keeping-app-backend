const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const fetchUser = require("../middleware/fetchUser");
const { body, validationResult } = require("express-validator");

//Create a new customer. Auth required
router.post(
  "/addCustomer",
  fetchUser,
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("mobileno", "Enter a valid mobile number").isLength({ min: 10 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const existingCustomers = await Customer.find({ user: req.user.id });
      if (existingCustomers) {
        for (let index = 0; index < existingCustomers.length; index++) {
          if (existingCustomers[index].mobileno === req.body.mobileno) {
            return res.send("Customer with this mobile number already exists");
          }
        }
      }
      const customer = new Customer({
        user: req.user.id,
        name: req.body.name,
        email: req.body.email,
        mobileno: req.body.mobileno,
        address: req.body.address,
      });
      let customers = await customer.save();
      res.send(customers);
    } catch (error) {
      res.json({ error: "Internal Server Error" });
    }
  }
);

//Get all customers of a user
router.get("/getCustomers", fetchUser, async (req, res) => {
  try {
    let customers = await Customer.find({ user: req.user.id });
    if (!customers) {
      return res.json({ message: "No customers found" });
    }
    res.send(customers);
  } catch (error) {
    res.json({ error: "Internal Server Error" });
  }
});

//Get customer by customer id
router.get("/getCustomer/:id", fetchUser, async (req, res) => {
  try {
    let customer = await Customer.findOne({ _id: req.params.id });
    if (!customer) {
      return res.json({ message: "No customer found" });
    }
    res.send(customer);
  } catch (error) {
    res.json({ error: "Internal Server Error" });
  }
});

//Delete a customer for a user
router.delete("/deleteCustomer/:id", fetchUser, async (req, res) => {
  try {
    let customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.send("Not found");
    }
    if (customer.user.toString() !== req.user.id) {
      return res.send("Not authorized");
    }
    customer = await Customer.findByIdAndDelete(req.params.id);
    res.json({ Success: "Customer deleted successfully", customer: customer });
  } catch (error) {
    res.json({ error: "Internal Server Error" });
  }
});

//Updating a customer for a user
router.put("/updateCustomer/:id", fetchUser, async (req, res) => {
  let newCustomer = {};
  const { name, email, mobileno, address } = req.body;
  if (name) {
    newCustomer.name = name;
  }
  if (email) {
    newCustomer.email = email;
  }
  if (mobileno) {
    newCustomer.mobileno = mobileno;
  }
  if (address) {
    newCustomer.address = address;
  }
  let customer = await Customer.findById(req.params.id);
  if (!customer) {
    return res.send("Not found");
  }
  if (customer.user.toString() !== req.user.id) {
    return res.send("Not authorized");
  }
  let updatedCustomer = await Customer.findByIdAndUpdate(
    req.params.id,
    { $set: newCustomer },
    { new: true }
  );
  res.json({
    Success: "Customer updated successfully",
    customer: updatedCustomer,
  });
});

module.exports = router;
