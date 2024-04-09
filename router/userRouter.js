const express = require('express');
const router = express.Router();

// Service
const userService = require('../service/userService');

// route GET
router.get("/certification", async (req, res) => {
  userService.certification(req, res);
});

// route POST
router.post("/sign_up", async (req, res) =>{
  userService.signUp(req, res);
});

router.post("/sign_in", async (req, res) => {
    userService.signIn(req, res);
});

module.exports = router;