const express = require('express');
const token = require('../function/jwt');
const payController = require('../controllers/payController');

const router = express.Router();

router.get('/search', payController.searchPay);
router.get('/success', payController.success);
router.get('/fail', payController.fail);
router.get('/cancel', payController.cancel);

/**
* @swagger
* components:
*   securitySchemes:
*     bearerAuth:
*       type: http
*       scheme: bearer
*       bearerFormat: JWT
*/


/**
* @swagger
* /pay:
*   post:
*     summary: 카카오페이 결제 요청
*     tags: [Payment]
*     security:
*       - bearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               userName:
*                 type: string
*                 description: 결제 요청 사용자 이름
*               itemName:
*                 type: string
*                 description: 결제할 상품 이름
*               quantity:
*                 type: integer
*                 description: 상품 수량
*               totalAmount:
*                 type: number
*                 description: 총 결제 금액
*               vatAmount:
*                 type: number
*                 description: 부가세 금액
*               taxFreeAmount:
*                 type: number
*                 description: 비과세 금액
*               storeId:
*                 type: string
*                 description: (선택 사항) 가게 ID
*               productId:
*                 type: string
*                 description: (선택 사항) 상품 ID
*               fundingId:
*                 type: string
*                 description: (선택 사항) 펀딩 ID
*               itemId:
*                 type: string
*                 description: (선택 사항) 후원 상품 ID
*     responses:
*       201:
*         description: 결제 요청이 성공적으로 처리됨
*         content:
*           application/json:
*             schema:
*               type: string
*               description: 결제 페이지로 리디렉션할 URL
*       500:
*         description: 카카오페이 결제 요청 실패
*/
router.post('', token.verifyToken, payController.payRequest);

module.exports = router;