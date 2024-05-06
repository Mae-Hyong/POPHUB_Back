const upload = require('../function/multer');
const express = require('express');
const router = express.Router();

// Service
const userService = require('../service/userService');
const { signController, authController, userController } = require('../controllers/userController');


// sign route
router.post("/sign_up", signController.signUp);
router.post("/sign_in", signController.signIn);

// auth route
router.post("/certification", authController.certification);
router.post("/verify", authController.verifyCertification);

// user route
router.get("/searc_user_data", userController.searchUser);
router.get("/doubleCheck", userController.doubleCheck);
router.get("/searc_id", userController.searchId);
router.post("/change_password", userController.changePassword);
router.post("/create_Profile", upload.single("file"), userController.createProfile);
router.post("/update_profile", upload.single("file"), userController.updateProfile);


// route GET
router.get("/inquiry_data_search", async (req, res) => {
  userService.inquiryDataSearch(req, res);
})


// route POST
router.post("/inquiry_add", async (req, res) => {
  userService.inquiryDataAdded(req, res);
});

module.exports = router;