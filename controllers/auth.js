const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
require('dotenv').config();
const Auth = require('../models/AuthModel');
const JWT_SECRET=process.env.JWT_SECRET;
const PORT=process.env.PORT;
const Password=process.env.PASSWORD;



//using nodemailer for sending mail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'rafimoqaddus@gmail.com',
      pass: Password, //generated for this app.
    },
  });


const signupUser = async(req, res) => {
    //gets username,email,password.
    const { username,email,password } = req.body;
    
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
    try{
        const newUser = new Auth({
            username,
            email,
            password,

          });
      
          await newUser.save();
        
    } catch (error) {
        return res.status(400).json({message:error.message});
    }
    
    
    //Now sending verification email with the link to frontend(no frontend so verify api will be called)
    const verificationLink = `http://localhost:${PORT}/api/auth/verify?token=${token}`;
    try{
        await transporter.sendMail({
            from: 'rafimoqaddus@gmail.com',
            to: email,
            subject: 'Email Verification',
            html: `<p>Click on this link to verify your email:</p><a href="${verificationLink}">Verify Email</a>`,
        });
        res.json({ message: 'Verification email sent',link: verificationLink});
    }
    catch(error){
        console.error("Error sending email:", error);
    }
    
};

//Called after user clicks on the link in verification email
const verifyUser = async(req, res) => {
    const {token}=req.query;
    try{

        //token verified and email fetched
        const {email}=jwt.verify(token,JWT_SECRET);
        const user =await Auth.findOne({email});

        //user verified status set to true if user found.
        if(user)
        {
            user.isVerified=true;
            await user.save();
            res.send('Email successfully verified!You can now login');

        }
        else
        {
            res.status(400).send('User not found');
        }
    }
    catch(error){
        console.log(error);
        res.status(400).send('Token invalid');
    }


}

const loginUser = async(req, res) => {

    //gets email and password from user
    const {email,password}=req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const user =await Auth.findOne({email});
    //if user with the given email found and his email verified.
    if(user && user.isVerified)
    {
        const isMatch = await bcrypt.compare(password, user.password);
        //if password matched
        if(isMatch)
        {
            //token produced for authorization process
            const token = jwt.sign({ email: user.email }, JWT_SECRET);
            res.json({ message: 'You have successfully logged in', token });
        }
        else
        {
            res.status(400).send('Wrong Password!!');  
        }
    }
    else
    {
        res.status(400).send('User not found');   
    }
};

const changePassword = async(req, res) => {
    //gets current password and new password from user.
    const {currPass,newPass}=req.body;

    if ( !currPass|| !newPass) {
        return res.status(400).json({ error: 'All fields are required' });
      }
    const email=req.data; //stored in middleware(fetched from token)
    const user=await Auth.findOne({email});

    //user is the one whose password needs to be changed
    if(!user)
    {
        return res.status(400).send("User not found");
    }
    else
    {
        const isMatch = await bcrypt.compare(currPass, user.password);
        //if current password matched with user's password.
        if(isMatch)
        {
            try {
                user.password=newPass;
                await user.save();
                return res.status(200).send("Password Changed Successfully!!")
                
            } catch (error) {
                return res.status(400).json({message:error.message});
            }
            
        }
        else
        {
            return res.status(400).send("Wrong password!!")
        }
    }

}

const forgotPassword= async(req,res)=>{
    const {email}=req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
    const user= await Auth.findOne({email});
   
    if(!user)
    {
        return res.status(400).send("User not found")
    }
    else  //if the user with given email exists
    {
        if(!user.isVerified)
        {
            return res.status(400).send("Your email verification is not done yet.")
        }
        else
        {
            //reset token generation
            const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
            user.reset_token=token;
            user.token_expiry= Date.now() + 1000 * 60 * 60;
            await user.save();
        
            //Here we will send mail with the reset password link to verify user has this email.
             //Now sending password reset email
             const resetLink = `http://localhost:${PORT}/api/auth/resetPassword?token=${token}`;
             try{
                await transporter.sendMail({
                    from: 'rafimoqaddus@gmail.com',
                    to: email,
                    subject: 'Reset Password',
                     html: `<p>Click on this link to reset you password:</p><a href="${resetLink}">Verify Email</a>`,
                });
                res.json({ message: 'Reset Password mail sent',link: resetLink }); //included in response as theres no frontend yet.
            }
            catch(error){
                console.error("Error sending email:", error);
            }

        }
    }
}

//called after reset password link clicked in email
const resetPassword= async(req,res)=>{
    const {token}=req.query;
    const {newPass}=req.body; //gets new password from user
    try{
        const {email}=jwt.verify(token,JWT_SECRET);
        const user =await Auth.findOne({email});
        //if user exists
        if(user)
        {   //if token valid
            if(user.reset_token==token && user.token_expiry>Date.now())
            {
                //saving the new password
                try {
                    user.password=newPass;
                    user.reset_token=null;
                    user.token_expiry=null;
                    await user.save();
                    return res.status(200).send("Password Reset Successful!")
                    
                } catch (error) {
                    return res.status(400).json({message:error.message});
                }
                
            }
            else
            {
                return res.status(400).send("Invalid Token")
            }

        }
        else
        {
            res.status(400).send("User Not found");
        }

    }
    catch(error){
        console.error("Error resetting password:", error);
    }
}

module.exports = {
  signupUser,
  verifyUser,
  loginUser,
  changePassword,
  forgotPassword,
  resetPassword,
};
