const jwt = require('jsonwebtoken');
require('dotenv').config();
const Auth = require('../models/AuthModel');

JWT_SECRET=process.env.JWT_SECRET;
const { users } = require('../controllers/auth');

const authenticateUser=async(req,res,next)=>{
    const authHeader=req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer '))
    {
        return res.status(401).send("Invalid access")
    }
    else
    {
        try{
            const token=authHeader.split(' ')[1];
            const {email}= jwt.verify(token,JWT_SECRET);
            const user=await Auth.findOne({email});
            if(user && user.isVerified)
            {
                req.data=email;
                
                return next();
            }
            return res.status(400).send("Invalid user");

        }
        catch(error)
        {
            console.log(error);
            return res.status(400).send("Attempt Failed");
        }
    }


}

module.exports = {
    authenticateUser
  };