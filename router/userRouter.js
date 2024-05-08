const upload = require('../function/multer');
const express = require('express');
const router = express.Router();

// Service
const { signController, authController, userController } = require('../controllers/userController');


// sign route
router.post("/sign_up", signController.signUp);
router.post("/sign_in", signController.signIn);

// auth route
router.post("/certification", authController.certification);
router.post("/verify", authController.verifyCertification);

// user route
router.get("/searh_user/:userId", userController.searchUser);
router.get("/check/:userId", userController.doubleCheck);
router.get("/check/:userName", userController.doubleCheck);
router.get("/searh_id/:phoneNumber", userController.searchId);
router.post("/change_password", userController.changePassword);
router.post("/create_Profile", upload.single("file"), userController.createProfile);
router.post("/update_profile", upload.single("file"), userController.updateProfile);

router.get("/search_inquiry", userController.searchInquiry);
router.post("/create_inquiry", userController.createInquiry);
router.get("/select_inquiry/:inquiry_id", userController.selectInquiry);

module.exports = router;