const productModel = require('../models/productModel');

const productController = {
    allProducts: async (req, res) => {
        try {
            const result = await productModel.allProducts();
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            throw err;
        }
    },

    createProduct: async (req, res) => { // 상품 등록
        try {
            const store_id = req.body.store_id;
            const user_id = req.body.user_id;
            const productData = req.body.productData;
            if (!user_id) {
                return res.status(400).send("로그인 후 사용해주세요");
            }
            const productdata = {
                store_id,
                product_name: productData.product_name,
                product_price: productData.product_price,
                product_description: productData.product_description
            };
            const result = await productModel.createProduct(productdata);
            const product_id = result.product_id;
            res.status(201).json(` ${product_id} 해당 상품이 등록되었습니다.`);
        } catch (err) {
            console.log(err);
            throw err;
        }
    },

    storeProduct: async (req, res) => { // 스토어별 product
        try {
            const store_name = req.body.store_name;
            const products = await productModel.getProduct(store_name);

            res.status(200).json(products);
        } catch (err) {
            throw err;
        }
    },

    storeProductDetail: async (req, res) => { // 상품 상세 조회
        try {
            const product_id = req.params.product_id;    
            const productDetail = await productModel.storeProductDetail(product_id);
            res.status(200).json(productDetail);
        } catch (err) {
            throw err;
        }
    },

    updateProduct: async (req, res) => {
        try {
            const product_id = req.params.product_id;
            const productData = req.body.productData;
            await productModel.updateProduct(product_id, productData);
            res.status(200).json(`${product_id} 수정되었습니다.`);
        } catch (err) {
            throw err;
        }
    },

    deleteProduct: async (req, res) => {
        try {
            const product_id = req. params.product_id;
            await productModel.deleteProduct(product_id);
            res.status(200).json(`${product_id}가 삭제되었습니다.`);
        } catch (err) {
            throw err;
        }
    }
}

module.exports = { productController }