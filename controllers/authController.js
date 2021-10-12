const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { promisify } = require("util");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

const signToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
  return token;
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user
    }
  });
};

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // Check if email and password is provided
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  // Check if password is valid or not there
  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password"), 401);
  }
  createAndSendToken(user, 200, res);
});

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });
  createAndSendToken(newUser, 201, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new AppError("You are not logged in. Please login first"), 401);
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const loggedUser = await User.findById(decoded.id);
  if (!loggedUser) {
    return next(new AppError("The user belonging to this token does no longer exists"));
  }

  if (loggedUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User changed password recently. Please log in again", 401)
    );
  }

  req.user = loggedUser;
  next();
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  if (!(await user.checkPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your password is incorrect", 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createAndSendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on posted email
  const user = await User.findOne({ email: req.params.email });
  if (!user) {
    return next(new AppError("No user found with that id", 404));
  }
  // 2. Generate random token
  // 3. Send it via email
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //  1) Get user based on the token
  //  2) If token has not expired and there is a user, set new Password
  //  3) Update changedPasswordAt property at current user
  //  4) Log the user in
});

exports.logout = catchAsync(async (req, res, next) => {
  res.clearCookie("jwt").send();
});
