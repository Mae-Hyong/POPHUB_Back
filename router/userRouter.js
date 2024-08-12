const express = require('express');
const router = express.Router();
const multerimg = require('../function/multer');
const token = require('../function/jwt');
const { signController, authController, userController } = require('../controllers/userController');

/**
 * @swagger
 * /user/signUp:
 *   post:
 *     summary: 회원가입
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               userPassword:
 *                 type: string
 *               userRole:
 *                 type: string
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *       500:
 *         description: 오류 발생
 */
router.post("/signUp", signController.signUp);

/**
 * @swagger
 * /user/signIn:
 *   post:
 *     summary: 로그인
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               authPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: 로그인 성공
 *       500:
 *         description: 오류 발생
 */
router.post("/signIn", signController.signIn);

/**
 * @swagger
 * /user/certification:
 *   post:
 *     summary: 인증 코드 메세지 전송
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 메세지 전공 성공
 *       500:
 *         description: 오류 발생
 */
router.post("/certification", authController.certification);

/**
 * @swagger
 * /user/verify:
 *   post:
 *     summary: 인증 코드 비교
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               authCode:
 *                 type: integer
 *              expectedCode:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 인증 성공
 *       500:
 *         description: 오류 발생
 */
router.post("/verify", authController.verifyCertification);

/**
 * @swagger
 * /user/check:
 *   get:
 *     summary: 사용자 아이디 혹은 닉네임 체크
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: userName
 *         schema:
 *           type: string
 *         required: false
 *     responses:
 *       200:
 *         description: POSTMAN으로 확인 필요
 *       400:
 *         description: 사용자 userName 혹은 Id를 제공 필요
 *       500:
 *         description: 오류 발생
router.get("/check", userController.doubleCheck);

/**
 * @swagger
 * /user/searchId:
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
 * /user/point:
 *   get:
 *     summary: 포인트 내역 조회
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *     responses:
 *       200:
 *         description: 조회 성공
 *       500:
 *         description: 오류 발생
 */
router.get("/point", userController.searchPoint);

/**
 * @swagger
 * /user/changePassword:
 *   post:
 *     summary: 비밀번호 변경
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               userPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: 변경 성공
 *       400:
 *         description: User ID 제공 필요
 *       500:
 *         description: 오류 발생
 */
router.post("/changePassword", userController.changePassword);

/**
 * @swagger
 * /user/inquiry/search:
 *   get:
 *     summary: 문의 조회
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: userName
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: inquiryId
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 문의 조회 성공
 *       500:
 *         description: 오류 발생
 */
router.get("/inquiry/search", userController.searchInquiry);

/**
 * @swagger
 * /user/answer/search:
 *   get:
 *     summary: 문의 답변 조회
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: inquiryId
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: 조회 성공
 *       400:
 *         description: 문의 ID 미존재
 *       404:
 *         description: 문의 미존재
 *       500:
 *         description: 오류 발생
 */
router.get("/answer/search", token.verifyToken, userController.searchAnswer);

/**
 * @swagger
 * /user/profile/create:
 *   post:
 *     summary:프로필 생성
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               userName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               Gender:
 *                 type: string
 *               Age:
 *                 type: integer
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: 프로필 생성
 *       500:
 *         description: 오류 발생
 */
router.post("/profile/create", token.verifyToken, multerimg.upload.single("file"), userController.createProfile);

/**
 * @swagger
 * /user/profile/update:
 *   post:
 *     summary: Update an existing profile
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               userName:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: 프로필 업데이트 성공
 *       500:
 *         description: 오류 발생
 */
router.post("/profile/update", token.verifyToken, multerimg.upload.single("file"), userController.updateProfile);

/**
 * @swagger
 * /user/achieveHub:
 *   get:
 *     summary: 업적 조회
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               achieveId:
 *                 type: number
 *     responses:
 *       200:
 *         description: 조회 성공
 *       404:
 *         description: UserName 혹은 achieveId 미존재
 *       500:
 *         description: 오류 발생
 */
router.get("/achieveHub", token.verifyToken, userController.searchAchiveHub);

/**
 * @swagger
 * /user/point/gain:
 *   post:
 *     summary: 포인트 추가
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               points:
 *                 type: number
 *               description:
 *                 type: string
 *               calcul:
 *                 type: string
 *     responses:
 *       201:
 *         description: 포인트 추가 성공
 *       500:
 *         description: 오류 발생
 */
router.post("/point/gain", token.verifyToken, userController.gainPoint);

/**
 * @swagger
 * /user/{userId}:
 *   get:
 *     summary: 사용자 정보 조회
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 사용자 정보 조회 성공
 *       500:
 *         description: 오류 발생
 */
router.get("/:userId", token.verifyToken, userController.searchUser);

/**
 * @swagger
 * /user/inquiry/create:
 *   post:
 *     summary: 문의 생성
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               categoryId:
 *                 type: number
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: 문의 생성 성공
 *       500:
 *         description: 오류 발생
 */
router.post("/inquiry/create", token.verifyToken, multerimg.upload.single("file"), userController.createInquiry);

/**
 * @swagger
 * /user/delete:
 *   post:
 *     summary: 유저 삭제
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: 유저 삭제 성공
 *       500:
 *         description: 오류 발생
 */
router.post("/delete", token.verifyToken, userController.deleteUser);

module.exports = router;
