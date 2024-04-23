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

    createProduct: async (req, res) => {
        try {
            const store_id = req.params.store_id; // 로그인 정보로 수정할 예정
            const { productData } = req.body; 
            const data = {
                store_id: store_id,
                product_name: productData.product_name,
                product_price: productData.product_price,
                product_description: productData.product_description
            };
            const productDataResult = await productModel.createProduct(data);
            const product_id = productDataResult.product_id;
            res.status(201).send(` ${product_id} 해당 상품이 등록되었습니다.`);
        } catch(err) {
            console.log(err);
            throw err;
        }
    },

    getProduct: async (req, res) => {
        try {
            const store_name = req.body.store_name;
            const products = await productModel.getProduct(store_name);
            
            res.status(200).send({ products: products });
        } catch (err) {
            throw err;
        }
    },
}

module.exports = { productController }