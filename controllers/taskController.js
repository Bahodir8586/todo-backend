const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const Task = require("./../models/taskModel");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

exports.getTasks = catchAsync(async (req, res, next) => {
  const tasks = await User.findById(req.user.id).select("tasks");
  res.status(200).json({
    status: "success",
    data: {
      tasks
    }
  });
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
  const updatedTasks = await User.findOneAndUpdate(
    { "_id": req.user.id },
    {
      $set: {
        "tasks.$[el]": req.body
      }
    },
    {
      arrayFilters: [{ "el._id": req.params.id }]
    }
  ).select("-_id -name -email -__v")

  res.status(200).json({
    status: "success",
    data: {
      data: updatedTasks
    }
  });
})
;
exports.deleteTask = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { $pull: { "tasks": { _id: req.params.id } } });
  res.status(204).json({
    status: "success",
    data: null
  });

});
exports.getTask = catchAsync(async (req, res, next) => {

});
;
