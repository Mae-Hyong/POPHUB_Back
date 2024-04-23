const express = require('express');
const router = express.Router();
const {productController} = require('../controllers/productController');


router.get('/', productController.allProducts);
router.post('/create/:store_id', productController.createProduct);
router.post('/view', productController.getProduct);

module.exports = router;