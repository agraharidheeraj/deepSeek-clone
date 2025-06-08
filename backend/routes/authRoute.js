const express = require('express')
const {register,login,getCurrentUser,googleCallback} = require('../controllers/authController');
const authMiddleware = require('../middlerware/authMiddleware');
const passport = require('passport');

const router = express.Router();

//Register new user
router.post('/register', register)

//Login user
router.post('/login', login)


//get currect user 
router.get('/me', authMiddleware,getCurrentUser);

//Google Oauth routes
router.get("/google", passport.authenticate('google',{ scope: ['profile', 'email'] }))

router.get('/google/callback', passport.authenticate('google', {session:false,failureRedirect: '/sign-in' }),googleCallback )

router.post('/logout' , (req,res) =>{
    res.clearCookie("auth_token", {
        httpOnly:true,
        sameSite:'none',
        secure:true
    })
    return  res.status(201).json({ message: "user logout success" });
})



module.exports= router;
