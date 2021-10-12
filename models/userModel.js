const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const crypto = require("crypto");

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
    lowerCase: true,
    validator: [validator.isEmail, "Please provide a valid email"]
  },
  photo: {
    type: String
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please provide a password confirmation"],
    validate: {
      validator: function(el) {
        return this.password === el;
      },
      message: "Passwords are not the same"
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  tasks: [
    {
      name: {
        type: String,
        required: [true, "Task name can not be empty"]
      },
      status: {
        type: String,
        default: "todo",
        enum: ["todo", "finished"]
      }
    }
  ]
});

// Hashing the password before saving and deleting passwordConfirm
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function(next) {
  if (!this.isModified("password") || this.isNew) {
    return next();
  }
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre("aggregate", function(next) {
  this.pipeline().unshift({ $project: { __v: 0, password: 0 } });

  console.log(this.pipeline());
  next();
});

userSchema.methods.checkPassword = async function(candidatePassword, hashedRealPassword) {
  return await bcrypt.compare(candidatePassword, hashedRealPassword);
};

userSchema.methods.createPasswordResetToken = async function() {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.passwordResetExpires = Date.now() + 2 * 60 * 60 * 1000;
  return resetToken;
};

userSchema.methods.changedPasswordAfter = function(JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = +(this.passwordChangedAt.getTime() / 1000);
    return JWTTimeStamp < changedTimeStamp;
  }
  return false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
