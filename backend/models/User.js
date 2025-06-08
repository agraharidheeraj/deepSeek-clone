const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    minlength: 6,
  },
  profilePicture: {
    type: String,
  },
  provider:{
        type: String,
        enum:["credentials", "google"],
        default:"credentials"
  },
  providerId:{
           type: String,
  }
}, {timestamps:true});

UserSchema.pre('save', async function(next) {
    if(!this.isModified('password') || !this.password) return next();
    try {
        const salt =  await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password,salt);
        next ();
    } catch (error) {
        next(error)
    }
})

UserSchema.methods.comparePassword = async function(candidatePassword) {
    if(!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('User', UserSchema)
