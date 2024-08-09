const express = require('express');
const router = express.Router();
const multerimg = require('../function/multer');
const token = require('../function/jwt');
const { signController, authController, userController } = require('../controllers/userController');

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management and authentication
 */

/**
 * @swagger
 * /signUp:
 *   post:
 *     summary: Sign up a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 */
router.post("/signUp", signController.signUp);

/**
 * @swagger
 * /signIn:
 *   post:
 *     summary: Sign in an existing user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Signed in successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/signIn", signController.signIn);

/**
 * @swagger
 * /certification:
 *   post:
 *     summary: Send certification
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Certification sent
 *       400:
 *         description: Error occurred
 */
router.post("/certification", authController.certification);

/**
 * @swagger
 * /verify:
 *   post:
 *     summary: Verify certification
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Certification verified
 *       400:
 *         description: Verification failed
 */
router.post("/verify", authController.verifyCertification);

/**
 * @swagger
 * /check:
 *   get:
 *     summary: Check if the username is available
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Username available
 *       400:
 *         description: Username not available
 */
router.get("/check", userController.doubleCheck);

/**
 * @swagger
 * /searchId:
 *   get:
 *     summary: Search for a user ID
 *     tags: [User]
 *     responses:
 *       200:
 *         description: User ID found
 *       400:
 *         description: User ID not found
 */
router.get("/searchId", userController.searchId);

/**
 * @swagger
 * /point:
 *   get:
 *     summary: Get user's points
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Points retrieved successfully
 *       400:
 *         description: Error occurred
 */
router.get("/point", userController.searchPoint);

/**
 * @swagger
 * /changePassword:
 *   post:
 *     summary: Change user's password
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Error occurred
 */
router.post("/changePassword", userController.changePassword);

/**
 * @swagger
 * /inquiry/search:
 *   get:
 *     summary: Search for inquiries
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Inquiries retrieved successfully
 *       400:
 *         description: Error occurred
 */
router.get("/inquiry/search", userController.searchInquiry);

/**
 * @swagger
 * /answer/search:
 *   get:
 *     summary: Search for answers
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Answers retrieved successfully
 *       400:
 *         description: Error occurred
 */
router.get("/answer/search", token.verifyToken, userController.searchAnswer);

/**
 * @swagger
 * /profile/create:
 *   post:
 *     summary: Create a new profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile created successfully
 *       400:
 *         description: Error occurred
 */
router.post("/profile/create", token.verifyToken, multerimg.upload.single("file"), userController.createProfile);

/**
 * @swagger
 * /profile/update:
 *   post:
 *     summary: Update a profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Error occurred
 */
router.post("/profile/update", token.verifyToken, multerimg.upload.single("file"), userController.updateProfile);

/**
 * @swagger
 * /achieveHub:
 *   get:
 *     summary: Search for achievements
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Achievements retrieved successfully
 *       400:
 *         description: Error occurred
 */
router.get("/achieveHub", token.verifyToken, userController.searchAchiveHub);

/**
 * @swagger
 * /point/gain:
 *   post:
 *     summary: Gain points
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Points gained successfully
 *       400:
 *         description: Error occurred
 */
router.post("/point/gain", token.verifyToken, userController.gainPoint);

/**
 * @swagger
 * /{userId}:
 *   get:
 *     summary: Get user information by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *       400:
 *         description: Error occurred
 */
router.get("/:userId", token.verifyToken, userController.searchUser);

/**
 * @swagger
 * /inquiry/create:
 *   post:
 *     summary: Create a new inquiry
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Inquiry created successfully
 *       400:
 *         description: Error occurred
 */
router.post("/inquiry/create", token.verifyToken, multerimg.upload.single("file"), userController.createInquiry);

/**
 * @swagger
 * /delete:
 *   post:
 *     summary: Delete a user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Error occurred
 */
router.post("/delete", token.verifyToken, userController.deleteUser);

module.exports = router;
