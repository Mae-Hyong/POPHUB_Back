const multerimg = require('../function/multer');
const token = require('../function/jwt');

const express = require('express');
const router = express.Router();

const { signController, authController, userController } = require('../controllers/userController');

// sign route
router.post("/signUp", signController.signUp);
router.post("/signIn", signController.signIn);

// auth route
router.post("/certification", authController.certification);
router.post("/verify", authController.verifyCertification);

// user route
router.get("/check", userController.doubleCheck);
router.get("/searchId", userController.searchId);
router.post("/changePassword", userController.changePassword);
router.get("/inquiry/search", userController.searchInquiry);
router.get("/searchAnswer", token.verifyToken, userController.searchAnswer);
router.post("/profile/create", token.verifyToken, multerimg.upload.single("file"), userController.createProfile);
router.post("/profile/update", token.verifyToken, multerimg.upload.single("file"), userController.updateProfile);

// 토큰 검증 필요
router.get("/:userId", token.verifyToken, userController.searchUser);
router.post("/inquiry/create", token.verifyToken, multerimg.upload.single("file"), userController.createInquiry);

router.post("/userDelete", token.verifyToken, userController.deleteUser);

module.exports = router;