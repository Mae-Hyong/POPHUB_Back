const upload = require('../multer');
const express = require('express');
const router = express.Router();

// Service
const userService = require('../service/userService');

// route GET
router.get("/certification", async (req, res) => {
  userService.certification(req, res);
});

router.get("/user_data_search", async (req, res) => {
  userService.userDataSearch(req, res);
});

router.get("/name_data_Search", async (req, res) => {
  userService.userDoubleCheck(req, res);
});


// route POST
router.post("/sign_up", async (req, res) =>{
  userService.signUp(req, res);
});

router.post("/sign_in", async (req, res) => {
    userService.signIn(req, res);
});

router.post("/profile_added", upload.single("file"), async(req, res) => {
  userService.userDataAdd(req, res);
});

module.exports = router;