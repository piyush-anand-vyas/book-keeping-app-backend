const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/fetchUser')
const JWT_SECRET = "I'm using MERN stack";

router.post("/createUser",[
    body('name', 'Please enter valid name').isLength({min: 5}),
    body('email','Please enter valid email id').isEmail(),
    body('password','Please enter a valid password').isLength({min:4})
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
 try {
    let user = await User.findOne({email: req.body.email});
    if(user){
      return  res.status(400).send("User with this email already exists");
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);
    user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass
    })
    user.save();
    const data = {
      user:{
        id: user.id
      }
    }
    const authToken = jwt.sign(data, JWT_SECRET);
    res.json({authToken});
} catch (error) {
       res.json({error: "Internal Server Error"}); 
}
})

router.post('/login',[
  body('email','Please enter valid email id').isEmail(),
  body('password','Please enter a valid password').isLength({min:4})
], async (req,res)=>{
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const {email, password} = req.body;
      let user = await User.findOne({email});
      if(!user){
        return res.status(400).json({error: "Please enter valid credentials"});
      }
      let passwordCompare = await bcrypt.compare(password, user.password);
      if(!passwordCompare){
        return res.status(400).json({error: "Please enter valid credentials"});
      }
      const data = {
        user:{
          id: user.id
        }
      }
      const authToken = jwt.sign(data, JWT_SECRET);
      res.json({authToken});
    } catch (error) {
      res.json({error: "Internal Server Error"}); 
    }
})

router.get('/getUser', fetchUser, async(req, res) => {
  let id = req.user.id;
  let user = await User.findById(id);
  if(!user){
    return res.status(400).json({error: "Please enter valid credentials"});
  }
  res.send(user);
})

module.exports = router;