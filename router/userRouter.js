const upload = require('../multer');
const express = require('express');
const router = express.Router();

// Service
const userService = require('../service/userService');

// route GET
router.get("/certification", async (req, res) => {
  userService.certification(req, res);
});

router.get("/verify_certification", async (req, res) => {
  userService.verifyCertification(req, res);
});

router.get("/user_data_search", async (req, res) => {
  userService.userDataSearch(req, res);
});

router.get("/name_data_Search", async (req, res) => {
  userService.userDoubleCheck(req, res);
});

router.get("/id_search", async (req, res) => {
  userService.idSearch(req, res);
});

router.get("/inquiry_data_search", async (req, res) => {
  userService.inquiryDataSearch(req, res);
})


// route POST
router.post("/sign_up", async (req, res) => {
  userService.signUp(req, res);
});

router.post("/sign_in", async (req, res) => {
    userService.signIn(req, res);
});

router.post("/password_change", async (req, res) => {
  userService.passwordChange(req, res);
});

router.post("/profile_added", upload.single("file"), async(req, res) => {
  userService.userDataAdd(req, res);
});

router.post("/profile_update", upload.single("file"), async(req, res) => {
  userService.profileUpdate(req, res);
});

router.post("/inquiry_add", async (req, res) => {
  userService.inquiryDataAdded(req, res);
});

module.exports = router;