const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
require('dotenv').config();

const JWT_SECRET=process.env.JWT_SECRET;
const PORT=process.env.PORT;

//mock db
users = [];

//using nodemailer for sending mail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'rafimoqaddus@gmail.com',
      pass: 'xgcw nrpi klyd lght', //generated for this app.
    },
  });



const signupUser = async(req, res) => {
    //gets username,email,password.
    const { username,email,password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const exists= users.some(user => user.email == email);
    //email is checked in case a user with the email already exists
    if(exists)
    {
        return res.status(400).json({ message: 'User already exists' });
    }
    //token generted(includes email for verification)
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });

    //password hashed for storing in db(list)
    const hashPass=await bcrypt.hash(password, 12);

    //user created and pushed(saved in array)
    const newUser = { username,email,password:hashPass,isVerified: false, reset_token:null, token_expiry:null };
    users.push(newUser);
    
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
        const user = users.find(u => u.email == email);

        //user verified status set to true if user found.
        if(user)
        {
            user.isVerified=true;
            res.send('Email successfully verified!You can now login');

        }
        else
        {
            res.status(400).send('Token invalid');
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

    const user = users.find(u => u.email == email);
    //if user with the given email found and his email verified.
    if(user && user.isVerified)
    {
        const isMatch = await bcrypt.compare(password, user.password);
        //if password matched
        if(isMatch)
        {
            //token produced for authorization process
            const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });
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
    const user=users.find(u=> u.email==email);

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
            const hashPass=await bcrypt.hash(newPass, 12);
            user.password=hashPass;
            return res.status(200).send("Password Changed Successfully!!")
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
    const user= users.find(u=> u.email==email);
   
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

//called after reset password link pressed in email
const resetPassword= async(req,res)=>{
    const {token}=req.query;
    const {newPass}=req.body; //gets new password from user
    if (!newPass) {
        return res.status(400).json({ error: 'New Password required' });
    }
    try{
        const {email}=jwt.verify(token,JWT_SECRET);
        const user = users.find(u => u.email == email);
        //if user exists
        if(user)
        {   //if token valid
            if(user.reset_token==token && user.token_expiry>Date.now())
            {
                //saving the new password after hashing
                const hashPass=await bcrypt.hash(newPass, 12);
                user.password=hashPass;
                user.reset_token=null;
                user.token_expiry=null;
                return res.status(200).send("Password Reset Successful!")
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
  users
};
