const express = require('express');
const router = express.Router();
const {productController} = require('../controllers/productController');


router.get('/', productController.allProducts);
router.post('/create', productController.createProduct);
router.post('/view', productController.storeProduct);
router.put('/:product_id', productController.updateProduct);
router.get('/:product_id', productController.storeProductDetail);
router.delete('/:product_id', productController.deleteProduct);
router.get('/reviews/:product_id', productController.productReview);
router.get('/review/:review_id', productController.productReviewDetail);
router.post('/review/create/:product_id', productController.createReview);
module.exports = router;