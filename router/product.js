const express = require('express');
const router = express.Router();
const {productController} = require('../controllers/productController');


router.get('/', productController.allProducts);
router.post('/create', productController.createProduct);
router.post('/view', productController.storeProduct);
router.put('/:product_id', productController.updateProduct);
router.get('/:product_id', productController.storeProductDetail);
router.delete('/:product_id', productController.deleteProduct);
module.exports = router;