const upload = require('../function/multer');
const token = require('../function/jwt');

const express = require('express');
const router = express.Router();

const { signController, authController, userController } = require('../controllers/userController');


// sign route
router.post("/sign_up", signController.signUp);
router.post("/sign_in", signController.signIn);

// auth route
router.post("/certification", authController.certification);
router.post("/verify", authController.verifyCertification);

// user route
router.get("/search_user/:userId", token.verifyToken, userController.searchUser);
router.get("/check/:userId", userController.doubleCheck);
router.get("/check/:userName", userController.doubleCheck);
router.get("/search_id/:phoneNumber", userController.searchId);
router.post("/change_password", userController.changePassword);
router.post("/create_Profile", token.verifyToken, upload.single("file"), userController.createProfile);
router.post("/update_profile", token.verifyToken, upload.single("file"), userController.updateProfile);

router.get("/search_inquiry/:userName", token.verifyToken, userController.searchInquiry);
router.post("/create_inquiry", token.verifyToken, userController.createInquiry);
router.get("/select_inquiry/:inquiryId", token.verifyToken, userController.selectInquiry);
router.get("/search_answer/:inquiryId", token.verifyToken, userController.searchAnswer);

module.exports = router;