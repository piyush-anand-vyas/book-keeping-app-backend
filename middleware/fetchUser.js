const jwt = require("jsonwebtoken");
const JWT_SECRET = "I'm using MERN stack";

const fetchUser = (req, res, next) => {
  try {
    let token = req.header("auth-token");
    if (!token) {
      return res
        .status(401)
        .json({ error: "Please authenticate with valid credentials" });
    }
    let data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ error: "Please authenticate with valid credentials" });
  }
};

module.exports = fetchUser
