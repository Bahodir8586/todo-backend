const mongoose = require("mongoose");

const taskSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Task name can not be empty"]
  },
  status: {
    type: String,
    default: "todo",
    enum:['todo','finished']
  }
});

const Task = mongoose.model(taskSchema);
module.exports = Task;
