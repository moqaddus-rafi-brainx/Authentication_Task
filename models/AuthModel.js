const mongoose = require('mongoose');
const bcrypt=require('bcrypt');

const authSchema = new mongoose.Schema({
  username: {
    type: String,
    trim:true,
  },
  email: {
    type: String,
    trim:true,
  },
  password: {
    type: String,
    trim:true,
  },
  isVerified:{
    type:Boolean,
    default:false,
  },
  reset_token:{
    type:String,
    required:false,
    default:null,
  },
  token_expiry:{
    type:String,
    required:false,
    default:null,
  }

});

//USERNAME VALIDATION
authSchema.pre('save', async function (next) {
  if(!this.isModified('username'))
  {
    return next();
  }
  //Checking that username is not empty or just spaces
  if (this.username.trim() === '') {
    return next(new Error('username cannot be empty'));
  }
  //Checking  length of username
  if (this.username.trim().length < 4 || this.username.trim().length>20) {
    return next(new Error('Username length must be bw 4 - 20'));
  }
})

//EMAIL VALIDATION
authSchema.pre('save', async function (next) {
  const Auth = mongoose.model('Auth');
  //return if its not modified(or added)
  if(!this.isModified('email'))
  {
    return next();
  }
  //Checking that email is not empty or just spaces
  if (this.email.trim() === '') {
    return next(new Error('Email cannot be empty'));
  }

  //Checking email syntax
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(this.email)) {
    return next(new Error('Invalid email format'));
  }

  //Checking if email already exists
  const existingUser = await Auth.findOne({ email: this.email });
  if (existingUser) {
    const err = new Error('Email already exists');
    err.status = 400;
    return next(err);
  }
  next();
});

authSchema.pre('save', async function (next) {

  if (!this.isModified('password')) return next();

  //Checking that password is not empty or just spaces
  if (this.password.trim() === ''){
    return next(new Error('Password cant be empty'));
  }

  //Checking min length of password
  if (this.password.trim().length < 8) {
    return next(new Error('Password must be at least 8 characters long'));
  }

  //Hashing password before saving
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Auth', authSchema);
