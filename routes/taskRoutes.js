const express = require("express");
const taskController = require("./../controllers/taskController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.use("/", authController.protect);

router.route("/")
  .get(taskController.getTasks)
  .post(taskController.createTask)
  .delete(taskController.deleteAllTasks)

router.route('/:id')
  .get(taskController.getTask)
  .patch(taskController.updateTask)
  .delete(taskController.deleteTask)

module.exports = router;
