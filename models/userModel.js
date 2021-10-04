const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    minLength: 4,
    required: [true, "Please provide your name"]
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please provide your email"],
    lowerCase: true
  },
  photo:{
    type:String,
  },
  password: {
    type:String,
    required: [true, "Please provide a password"],
    minLength: 8,
    select:false
  },
  passwordConfirm:{
    type:String,
    required:[true, 'Please provide a password']
  }
});

// Hashing the password before saving and deleting passwordConfirm
userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
      next()
    }
    this.password=await bcrypt.hash(this.password,12)
    this.passwordConfirm=undefined;
    next()
})

userSchema.methods.checkPassword=async function(candidatePassword, hashedRealPassword){
  return await bcrypt.compare(candidatePassword, hashedRealPassword)
}

const User=mongoose.model('User',userSchema)

module.exports=User
