const fetchCustomer = (req, res, next) => {
  try {
    let customer_id = req.header("customer-id");
    if (!customer_id) {
      return res
        .status(401)
        .json({ error: "Please authenticate with valid credentials" });
    }
    req.customer = customer_id;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ error: "Please authenticate with valid credentials" });
  }
};

module.exports = fetchCustomer;
