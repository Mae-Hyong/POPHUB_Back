const express = require('express');
const router = express.Router();
const { productController } = require('../controllers/productController');


router.get('/', productController.allProducts); // 모든 굿즈
router.post('/create', productController.createProduct); // 굿즈 생성
router.post('/view', productController.getProduct); // 특정 굿즈 조회
router.put('/:product_id', productController.updateProduct); // 굿즈 수정
router.get('/:product_id', productController.storeProductDetail); // 특정 굿즈 상세 조회
router.delete('/:product_id', productController.deleteProduct); // 굿즈 삭제
router.get('/reviews/:product_id', productController.productReview); // 굿즈 리뷰
router.get('/review/:review_id', productController.productReviewDetail); // 굿즈 리뷰 상세 조회
router.post('/review/create/:product_id', productController.createReview); // 굿즈 리뷰 생성
router.put('/review/:review_id', productController.updateReview); // 굿즈 리뷰 수정
router.delete('/review/:review_id', productController.deleteReview); // 굿즈 리뷰 삭제
module.exports = router;