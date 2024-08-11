const express = require('express');
const router = express.Router();
const { productController } = require('../controllers/productController');
const multerimg = require('../function/multer');

/**
 * @swagger
 * /product/:
 *   get:
 *     tags: [Product]
 *     summary: 모든 상품 조회
 *     responses:
 *       200:
 *         description: 성공
 */
router.get('/', productController.allProducts); // 모든 굿즈

/**
 * @swagger
 * /product/store/{storeId}:
 *   get:
 *     tags: [Product]
 *     summary: 스토어별 상품 조회
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 성공
 */
router.get('/store/:storeId', productController.storeProducts); // 스토어별 굿즈 조회

/**
 * @swagger
 * /product/create/{storeId}:
 *  post:
 *      tags: [Product]
 *      summary: 상품 생성
 *      parameters:
 *          - in: path
 *            name: storeId
 *            required: true
 *            schema:
 *              type: string
 *      requestBody:
 *          required: true
 *          content:
 *              multipart/form-data:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          userName:
 *                              type: string
 *                          productName:
 *                              type: string
 *                          productPrice:
 *                              type: integer
 *                          productDescription:
 *                              type: string
 *                          remainingQuantity:
 *                              type: integer
 *                          
 *                          files:
 *                              type: array
 *                              items:
 *                                  type: string
 *                                  format: binary
 *      responses:
 *          201:
 *              description: 성공
 */
router.post('/create/:storeId', multerimg.upload.array("files", 5), productController.createProduct); // 굿즈 생성

/**
 * @swagger
 * /product/view/{productId}/{userName}:
 *   get:
 *     tags: [Product]
 *     summary: 상품 상세 조회
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userName
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 성공
 */
router.get('/view/:productId/:userName?', productController.getProduct); // 특정 굿즈 상세 조회

/**
 * @swagger
 * /product/update/{productId}:
 *  put:
 *      tags: [Product]
 *      summary: 상품 수정
 *      parameters:
 *          - in: path
 *            name: productId
 *            required: true
 *            schema:
 *              type: string
 *      requestBody:
 *          required: true
 *          content:
 *              multipart/form-data:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          userName:
 *                              type: string
 *                          productName:
 *                              type: string
 *                          productPrice:
 *                              type: integer
 *                          productDescription:
 *                              type: string
 *                          remainingQuantity:
 *                              type: integer
 *                          files:
 *                              type: array
 *                              items:
 *                                  type: string
 *                                  format: binary
 *      responses:
 *          201:
 *              description: 성공
 */
router.put('/update/:productId', multerimg.upload.array("files", 5), productController.updateProduct); // 상품 수정

/**
 * @swagger
 * /product/delete/{productId}:
 *  delete:
 *      tags: [Product]
 *      summary: 특정 상품 삭제
 *      parameters:
 *          - in: path
 *            name: productId
 *            required: true
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              description: 성공적으로 삭제됨
 */
router.delete('/delete/:productId', productController.deleteProduct); // 상품 삭제

/**
 * @swagger
 * /product/like/{productId}:
 *  post:
 *      tags: [Product]
 *      summary: 상품 찜 & 취소
 *      parameters:
 *          - in: path
 *            name: productId
 *            required: true
 *            schema:
 *              type: string
 *      requestBody:
 *          required: true
 *          content:
 *              application/x-www-form-urlencoded:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          userName:
 *                              type: string
 *      responses:
 *          201:
 *              description: 성공
 */
router.post('/like/:productId', productController.likeProduct); // 굿즈 찜

/**
 * @swagger
 * /product/likeUser/{userName}:
 *   get:
 *     tags: [Product]
 *     summary: 유저별 상품 찜 조회
 *     parameters:
 *       - in: path
 *         name: userName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 성공
 */
router.get('/likeUser/:userName', productController.likeUser); // 유저별 찜 조회


//router.put('/order/:productId', productController.orderProduct); // 굿즈 구매 
// 리뷰 삭제
// router.get('/reviews/:productId', productController.productReview); // 굿즈 리뷰
// router.get('/review/:review_id', productController.productReviewDetail); // 굿즈 리뷰 상세 조회
// router.post('/review/create/:productId', productController.createReview); // 굿즈 리뷰 생성
// router.put('/review/:review_id', productController.updateReview); // 굿즈 리뷰 수정
// router.delete('/review/:review_id', productController.deleteReview); // 굿즈 리뷰 삭제
module.exports = router;