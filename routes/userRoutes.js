const express = require("express");

const authController = require("./../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

router.patch("/updatePassword", authController.protect, authController.updatePassword);
router.route("/")
  .get(authController.protect, userController.get)
  .patch(authController.protect, userController.update)
  .delete(authController.protect, userController.delete);


module.exports = router;
