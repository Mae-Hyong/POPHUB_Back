const multerimg = require('../function/multer');
const token = require('../function/jwt');

const express = require('express');
const router = express.Router();

const { signController, authController, userController } = require('../controllers/userController');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     ApiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: authorization
 */

/**
 * @swagger
 * /user/signUp:
 *   post:
 *     tags: [User]
 *     summary: 회원가입
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               userPassword:
 *                 type: string
 *               userRole:
 *                 type: string
 *                 enum: [General Member, President, Manager]
 *                 description: "General Member: 일반 사용자, President: 판매자, Manager: 관리자"
 *     responses:
 *       201:
 *         description: 성공
 */
router.post("/signUp", signController.signUp);

/**
 * @swagger
 * /user/auth/kakao:
 *   get:
 *     tags: [User]
 *     summary: 카카오 로그인 페이지로 리다이렉트
 *     description: 클라이언트를 카카오 로그인 페이지로 리다이렉트합니다.
 *     responses:
 *       302:
 *         description: 리다이렉트 성공
 *       500:
 *         description: 서버 오류
 */
router.get("/auth/kakao", signController.oauthKakao);

router.get("/auth/kakao/callback", signController.kakaoCallBack);

/**
 * /user/kakao/delete
 *   delete:
 *     tags: [User]
 *     summary: 카카오 연동 해제
 *     description: 연동된 카카오 계정을 해제합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       302:
 *         description: 리다이렉트 성공
 *       500:
 *         description: 서버 오류
 */
router.get("/kakao/delete", signController.kakaoDelete);

/**
 * @swagger
 * /user/oauth/naver:
 *   get:
 *     tags: [User]
 *     summary: 네이버 로그인 페이지로 리다이렉트
 *     description: 클라이언트를 네이버 로그인 페이지로 리다이렉트합니다.
 *     responses:
 *       302:
 *         description: 리다이렉트 성공
 *       500:
 *         description: 서버 오류
 */
router.get("/oauth/naver", signController.oauthNaver);

router.get("/auth/naver/callback", signController.naverCallback);

router.get("/naver/clear", signController.clearNaver);

router.get("/naver/delete", signController.naverDelete);
/**
 * @swagger
 * /user/signIn:
 *   post:
 *     tags: [User]
 *     summary: 로그인
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
 *         description: 성공
 */
router.post("/signIn", signController.signIn);

/**
 * @swagger
 * /user/certification:
 *   post:
 *     tags: [User]
 *     summary: SMS 전송
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: 성공
 */
router.post("/certification", authController.certification);

/**
 * @swagger
 * /user/verify:
 *   post:
 *     tags: [User]
 *     summary: SMS 인증
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               authCode:
 *                 type: integer
 *               expectedCode:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 성공
 */
router.post("/verify", authController.verifyCertification);

// user route

/**
 * @swagger
 * /user/check:
 *   get:
 *     tags: [User]
 *     summary: 사용자 ID & Name 중복 확인
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
 *         description: 성공
 */
router.get("/check", userController.doubleCheck);

/**
 * @swagger
 * /user/searchId:
 *   get:
 *     tags: [User]
 *     summary: 아이디 찾기
 *     parameters:
 *       - in: query
 *         name: phoneNumber
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: 성공
 */
router.get("/searchId", userController.searchId);

/**
 * @swagger
 * /user/point:
 *   get:
 *     summary: 포인트 내역 조회
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: userName
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: 성공
 */
router.get("/point", userController.searchPoint);

/**
 * @swagger
 * /user/changePassword:
 *   post:
 *     tags: [User]
 *     summary: 비밀번호 변경
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
 *         description: 성공
 */
router.post("/changePassword", userController.changePassword);

/**
 * @swagger
 * /user/inquiry/search:
 *   get:
 *     tags: [User]
 *     summary: 문의 검색
 *     parameters:
 *       - in: query
 *         name: userName
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: inquiryId
 *         schema:
 *           type: integer
 *         required: false
 *     responses:
 *       200:
 *         description: 성공
 */
router.get("/inquiry/search", userController.searchInquiry);

/**
 * @swagger
 * /user/answer/search:
 *   get:
 *     tags: [User]
 *     summary: 문의 답변 조회
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: inquiryId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: 성공
 */
router.get("/answer/search", token.verifyToken, userController.searchAnswer);

/**
 * @swagger
 * /user/profile/create:
 *   post:
 *     tags: [User]
 *     summary: 프로필 생성
 *     security:
 *       - ApiKeyAuth: []
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
 *                 example: "01012345678"
 *               Gender:
 *                 type: string
 *                 enum: [M, F]
 *               Age:
 *                 type: integer
 *                 example: 30
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: 성공
 */
router.post("/profile/create", token.verifyToken, multerimg.upload.single("file"), userController.createProfile);

/**
 * @swagger
 * /user/profile/update:
 *   post:
 *     tags: [User]
 *     summary: 프로필 수정
 *     security:
 *       - ApiKeyAuth: []
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
 *               userImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: 성공
 */

router.post("/profile/update", token.verifyToken, multerimg.upload.single("file"), userController.updateProfile);

/**
 * @swagger
 * /user/achieveHub:
 *   get:
 *     tags: [User]
 *     summary: 업적 조회
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: userName
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: 성공
 */
router.get("/achieveHub", token.verifyToken, userController.searchAchieveHub);

/**
 * @swagger
 * /user/{userId}:
 *   get:
 *     tags: [User]
 *     summary: 사용자 정보 조회
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: 성공
 */
router.get("/:userId", token.verifyToken, userController.searchUser);

/**
 * @swagger
 * /user/inquiry/create:
 *   post:
 *     tags: [User]
 *     summary: 문의 생성
 *     security:
 *       - ApiKeyAuth: []
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
 *                 type: integer
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: 성공
 */
router.post("/inquiry/create", token.verifyToken, multerimg.upload.single("file"), userController.createInquiry);

/**
 * @swagger
 * /user/delete:
 *   post:
 *     tags: [User]
 *     summary: 사용자 삭제
 *     security:
 *       - ApiKeyAuth: []
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
 *         description: 성공
 */
router.post("/delete", token.verifyToken, userController.deleteUser);

module.exports = router;