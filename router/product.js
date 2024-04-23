const express = require('express');
const router = express.Router();
const {productController} = require('../controllers/productController');


router.get('/', productController.allProducts);
router.post('/create/:store_id', productController.createProduct);
router.post('/view', productController.getProduct);
router.put('/:product_id', productController.updateProduct);
module.exports = router;