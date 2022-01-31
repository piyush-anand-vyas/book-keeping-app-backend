const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const CustomerBalance = require("../models/CustomerBalance");
const UserBalance = require("../models/UserBalance");
const Customer = require("../models/Customer");
const fetchCustomer = require("../middleware/fetchCustomer");
const fetchUser = require("../middleware/fetchUser");
const { body, validationResult } = require("express-validator");

//Create a new customer. Auth required
router.post(
  "/addTransaction",
  fetchUser,
  fetchCustomer,
  [
    body("amount", "Enter a valid amount").isNumeric(),
    body("details", "Enter valid details").isLength({ min: 3 }),
    body("type", "Enter a valid type").isLength({ min: 3 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const transaction = new Transaction({
        customer: req.customer,
        amount: req.body.amount,
        details: req.body.details,
        type: req.body.type,
      });
      let transactions = await transaction.save();
      let customerBalance = await CustomerBalance.findOne({
        customer: req.customer,
      });
      if (customerBalance) {
        if (req.body.type === "Send") {
          customerBalance.amount -= parseInt(req.body.amount);
        } else {
          customerBalance.amount += parseInt(req.body.amount);
        }
      } else {
        let camt = parseInt(req.body.amount);
        if (req.body.type === "Send") {
          customerBalance = await new CustomerBalance({
            customer: req.customer,
            amount: -camt,
          });
        } else {
          customerBalance = await new CustomerBalance({
            customer: req.customer,
            amount: camt,
          });
        }
      }
      customerBalance.save();
      let userBalance = await UserBalance.findOne({ user: req.user.id });
      if (userBalance) {
        if (req.body.type === "Send") {
          userBalance.amount -= parseInt(req.body.amount);
        } else {
          userBalance.amount += parseInt(req.body.amount);
        }
      } else {
        let uamt = parseInt(req.body.amount);
        if (req.body.type === "Send") {
          userBalance = await new UserBalance({
            user: req.user.id,
            amount: -uamt,
          });
        } else {
          userBalance = await new UserBalance({
            user: req.user.id,
            amount: uamt,
          });
        }
      }
      userBalance.save();
      res.send(transactions);
    } catch (error) {
      res.json({ error: "Internal Server Error" });
    }
  }
);

//Get all transactions of a customer
router.get(
  "/getCustomerTransactions",
  fetchUser,
  fetchCustomer,
  async (req, res) => {
    try {
      let transactions = await Transaction.find({ customer: req.customer });
      if (!transactions) {
        return res.json({ message: "No transactions found" });
      }
      res.send(transactions);
    } catch (error) {
      res.json({ error: "Internal Server Error" });
    }
  }
);

//Get all transactions of a user
router.get("/getUserTransactions", fetchUser, async (req, res) => {
  try {
  let customers = await Customer.find({ user: req.user.id });
  if (!customers) {
    return res.json({ message: "No transactions found" });
  }
  let filteredCustomers = [];
  for (let index = 0; index < customers.length; index++) {
    filteredCustomers.push(customers[index].id);
  }
  let transactions = await Transaction.find({
    customer: { $in: filteredCustomers },
  });
  if (!transactions) {
    return res.json({ message: "No transactions found" });
  }
  res.send(transactions);
  } catch (error) {
    res.json({ error: "Internal Server Error" });
  }
});

//Delete a transaction for a customer
router.delete("/deleteTransaction/:id", fetchUser, fetchCustomer, async (req, res) => {
  //try {
    let transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.send("Not found");
    }
    if (transaction.customer.toString() !== req.customer) {
      return res.send("Not authorized");
    }
    transaction = await Transaction.findByIdAndDelete(req.params.id);
    let customerBalance = await CustomerBalance.findOne({customer: req.customer});
    if(transaction.type === 'Send'){
        customerBalance.amount += transaction.amount; 
    }
    else{
        customerBalance.amount -= transaction.amount;
    }
    console.log("customerBalance",customerBalance);
    let updatedCustomerBalance = await CustomerBalance.findOneAndUpdate(
        {customer: req.customer},
        { $set: customerBalance },
        { new: true }
      );
    console.log("updatedCustomerBalance",updatedCustomerBalance);
    let userBalance = await UserBalance.findOne({user: req.user.id});
    if(transaction.type === 'Send'){
        userBalance.amount += transaction.amount; 
    }
    else{
        userBalance.amount -= transaction.amount;
    }
    console.log("userBalance",userBalance);
    let updatedUserBalance = await UserBalance.findOneAndUpdate(
        {user: req.user.id},
        { $set: userBalance },
        { new: true }
      );
    console.log("updatedUserBalance",updatedUserBalance);
    res.json({ Success: "Transaction deleted successfully", transaction: transaction });
//   } catch (error) {
//     res.json({ error: "Internal Server Error" });
//   }
});

//Updating a transaction
router.put("/updateTransaction/:id", fetchUser, fetchCustomer, async (req, res) => {
  let newTransaction = {};
  const { amount, details, type } = req.body;
  if (amount) {
    newTransaction.amount = +amount;
  }
  if (details) {
    newTransaction.details = details;
  }
  if (type) {
    newTransaction.type = type;
  }
  let transaction = await Transaction.findById(req.params.id);
  if (!transaction) {
    return res.send("Not found");
  }
  if (transaction.customer.toString() !== req.customer) {
    return res.send("Not authorized");
  }
  let updatedTransaction = await Transaction.findByIdAndUpdate(
    req.params.id,
    { $set: newTransaction },
    { new: true }
  );

  if(amount){
      let balance = Math.abs(transaction.amount - +amount); 
      let customerBalance = await CustomerBalance.findOne({customer: req.customer});
      console.log("custBalance", customerBalance);
      if(+amount > transaction.amount){
        if(updatedTransaction.type === 'Send'){
          customerBalance.amount -= balance;
        }
        else{
          customerBalance.amount += balance;
        }
      }
      else{
       if(updatedTransaction.type === 'Send'){
        customerBalance.amount += balance;
        }
        else{
          customerBalance.amount -= balance;
        }
      }
      console.log("customerBalance", customerBalance);
      let updatedCustomerBalance = await CustomerBalance.findOneAndUpdate(
        {customer: customerBalance._id},
        { $set: customerBalance },
        { new: true }
      );
      console.log("updatedCustomerBalance", updatedCustomerBalance);

      let userBalance = await UserBalance.findOne({user: req.user.id});
      if(+amount > transaction.amount){
        if(updatedTransaction.type === 'Send'){
          userBalance.amount -= balance;
        }
        else{
          userBalance.amount += balance;
        }
      }
      else{
       if(updatedTransaction.type === 'Send'){
        userBalance.amount += balance;
        }
        else{
          userBalance.amount -= balance;
        }
      }
      let updatedUserBalance = await UserBalance.findOneAndUpdate(
        {user: req.user.id},
        { $set: userBalance },
        { new: true }
      );
  }

  res.json({
    Success: "Transaction updated successfully",
    transaction: updatedTransaction,
  });
});

module.exports = router;
