const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv');
const User = require('../../models/User');

dotenv.config();

passport.use(new GoogleStrategy ({
     clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret:  process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`
},
  async(accessToken, refreshToken, profile, cb) => {
    try {
        let user = await User.findOne({email:profile.emails[0].value});
        if(user){
            if(!user.profilePicture){
                user.profilePicture = profile.photos[0].value;
                await user.save();
            }
        } else{
            user = await user.create({
                name:profile.displayName,
                email:profile.emails[0].value,
                profilePicture:profile.photos[0].value,
                provider:"google",
                providerId:profile.id,
            })
        }
        return cb(null,user)
    } catch (error) {
        return cb(error)
    }
  }
))