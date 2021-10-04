const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");


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
//   Give access and send token to the user there
});
