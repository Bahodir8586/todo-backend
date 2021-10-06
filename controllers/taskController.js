const Task = require("./../models/taskModel");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

exports.getTasks = catchAsync(async (req, res, next) => {

});
exports.createTask = catchAsync(async (req, res, next) => {
  const newTask = req.body;
  await User.findByIdAndUpdate(req.user.id, { $push: { "tasks": newTask } }, {
    new: true,
    runValidators: true
  });

  res.status(201).json({
    status: "success",
    data: {
      data: newTask
    }
  });
});
exports.updateTask = catchAsync(async (req, res, next) => {

});
exports.deleteTask = catchAsync(async (req, res, next) => {

});
exports.getTask = catchAsync(async (req, res, next) => {

});
