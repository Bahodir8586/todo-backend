const express = require('express');

const authController=require('./../controllers/authController')

const router = express.Router();

router.post('/signup', authController.signup)
router.post('/login', authController.login)

router.patch('/updatePassword', authController.protect, authController.updatePassword)

module.exports = router;
