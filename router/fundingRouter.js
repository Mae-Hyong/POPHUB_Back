const express = require('express');
const fundingController = require('../controllers/fundingController');
const router = express.Router();

const multerimg = require('../function/multer');

/**
 * @swagger
 * /funding/create:
 *   post:
 *     summary: 새로운 펀딩을 생성합니다.
 *     tags: [Funding]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               amount:
 *                 type: number
 *               donation:
 *                 type: number
 *               openDate:
 *                 type: string
 *                 format: date
 *               closeDate:
 *                 type: string
 *                 format: date
 *               paymentDate:
 *                 type: string
 *                 format: date
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Funding Data Added
 *       500:
 *         description: Funding 데이터를 입력 도중 오류가 발생했습니다.
 */
router.post("/create", multerimg.upload.array('images', 10), fundingController.createFunding);

/**
 * @swagger
 * /funding/item/create:
 *   post:
 *     summary: 펀딩 아이템을 생성합니다.
 *     tags: [Funding]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fundingId:
 *                 type: string
 *               userName:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               count:
 *                 type: integer
 *               amount:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Item Data Added
 *       500:
 *         description: Item 데이터를 입력 도중 오류가 발생했습니다.
 */
router.post("/item/create", fundingController.createItem);

/**
 * @swagger
 * /funding/support/create:
 *   post:
 *     summary: 펀딩 후원 목록 생성합니다.
 *     tags: [Funding]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemId:
 *                 type: string
 *               userName:
 *                 type: string
 *               amount:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Item Data Added
 *       500:
 *         description: Item 데이터를 입력 도중 오류가 발생했습니다.
 */
router.post("/support/create", fundingController.createFundingSupport);

/**
 * @swagger
 * /funding:
 *   get:
 *     summary: 펀딩을 검색합니다.
 *     tags: [Funding]
 *     parameters:
 *       - in: query
 *         name: fundingId
 *         required: false
 *         schema:
 *           type: string
 *         description: 검색할 펀딩의 ID
 *       - in: query
 *         name: userName
 *         required: false
 *         schema:
 *           type: string
 *         description: 검색할 펀딩의 사용자 이름
 *     responses:
 *       200:
 *         description: 성공적으로 펀딩 데이터를 반환합니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fundingId:
 *                   type: string
 *                 userName:
 *                   type: string
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 donation:
 *                   type: number
 *                 status:
 *                   type: string
 *                 openDate:
 *                   type: string
 *                   format: date
 *                 closeDate:
 *                   type: string
 *                   format: date
 *                 images:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: url
 *       500:
 *         description: 펀딩 조회 중 오류 발생
 */
router.get("", fundingController.searchFunding);

/**
* @swagger
* /funding/item:
*   get:
*     summary: 아이템을 검색하거나 펀딩을 검색합니다.
*     tags: [Funding]
*     parameters:
*       - in: query
*         name: fundingId
*         required: false
*         schema:
*           type: string
*         description: 검색할 펀딩의 ID
*       - in: query
*         name: itemId
*         required: false
*         schema:
*           type: string
*         description: 검색할 아이템의 ID
*     responses:
*       200:
*         description: 성공적으로 데이터를 반환합니다.
*         content:
*           application/json:
*             schema:
*               oneOf:
*                 - type: object
*                   properties:
*                     itemId:
*                       type: string
*                     fundingId:
*                       type: string
*                     userName:
*                       type: string
*                     itemName:
*                       type: string
*                     content:
*                       type: string
*                     count:
*                       type: integer
*                     amount:
*                       type: number
*                     images:
*                       type: array
*                       items:
*                         type: string
*                         format: url
*                 - type: array
*                   items:
*                     type: object
*                     properties:
*                       itemId:
*                         type: string
*                       fundingId:
*                         type: string
*                       userName:
*                         type: string
*                       itemName:
*                         type: string
*                       content:
*                         type: string
*                       count:
*                         type: integer
*                       amount:
*                         type: number
*                       images:
*                         type: array
*                         items:
*                           type: string
*                           format: url
*       404:
*         description: fundingId 혹은 itemId를 입력해야합니다.
*       500:
*         description: 아이템 조회 중 오류 발생
*/
router.get("/item", fundingController.searchItem);

/**
 * @swagger
 * /funding/support:
 *   get:
 *     summary: 후원자 목록을 검색합니다.
 *     parameters:
 *       - name: itemId
 *         in: query
 *         required: false
 *         type: string
 *       - name: userName
 *         in: query
 *         required: false
 *         type: string
 *       - name: supportId
 *         in: query
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               fundingId:
 *                 type: string
 *               itemId:
 *                 type: string
 *               userName:
 *                 type: string
 *               title:
 *                 type: string
 *               amount:
 *                 type: integer
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *       404:
 *         description: No support found
 */
router.get('/support', fundingController.searchSupport);

/**
 * @swagger
 * /funding/bookmark:
 *   post:
 *     summary: Toggle bookmark for a funding
 *     tags: [Funding]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               fundingId:
 *                 type: string
 *     responses:
 *       200:
 *         Successfully
 *       400:
 *         description: Missing userName or fundingId
 *       500:
 *         description: Internal server error
 */
router.post("/bookmark", fundingController.bookMark);

module.exports = router;