const productModel = require('../models/productModel');
const moment = require('moment');

const productController = {
    // 모든 굿즈 조회
    allProducts: async (req, res) => {
        try {
            const result = await productModel.allProducts();
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            throw err;
        }
    },

    // 굿즈 생성
    createProduct: async (req, res) => {
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

    // 굿즈 조회
    getProduct: async (req, res) => {
        try {
            const store_name = req.body.store_name;
            const products = await productModel.getProduct(store_name);

            res.status(200).json(products);
        } catch (err) {
            throw err;
        }
    },

    // 굿즈 상세 조회
    storeProductDetail: async (req, res) => {
        try {
            const product_id = req.params.product_id;    
            const productDetail = await productModel.storeProductDetail(product_id);
            res.status(200).json(productDetail);
        } catch (err) {
            throw err;
        }
    },

    // 굿즈 수정
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

    // 굿즈 삭제
    deleteProduct: async (req, res) => {
        try {
            const product_id = req. params.product_id;
            await productModel.deleteProduct(product_id);
            res.status(200).json(`${product_id}가 삭제되었습니다.`);
        } catch (err) {
            throw err;
        }
    },

    // 특정 굿즈 리뷰
    productReview: async (req, res) => {
        try {
            const product_id = req.params.product_id;
            const review = await(productModel.productReview(product_id));
            res.status(200).json(review);
        } catch (err) {
            throw err;
        }
    },

    // 굿즈 리뷰 상세 조회
    productReviewDetail: async (req, res) => {
        try {
            const review_id = req.params.review_id;
            const reviewDetail = await productModel.productReviewDetail(review_id);
            res.status(200).json(reviewDetail);
        } catch (err) {
            throw err;
        }
    },

    // 굿즈 리뷰 생성
    createReview: async (req, res) => {
        try {
            const user_id = req.body.user_id;

            if (!user_id) {
                return res.status(400).send("로그인 후 사용해주세요");
            }

            const product_id = req.params.product_id;
            const reviewData = req.body.reviewData;
            const review_date = moment().format('YYYY-MM-DD HH:mm:ss');
            const reviewdata = {
                user_id,
                product_id,
                review_rating: reviewData.review_rating,
                review_content: reviewData.review_content,
                review_date,
            }
            const allreview = await productModel.createReview(reviewdata);
            res.status(201).json(allreview);
        } catch (err) {
            throw err;
        }
    },

    // 굿즈 리뷰 수정
    updateReview: async (req, res) => {
        try {
            const user_id = req.body.user_id;
            if (!user_id) {
                return res.status(400).send("로그인 후 사용해주세요");
            }

            const review_id = req.params.review_id;
            const reviewData = req.body.reviewData;
            const review_modified_date = moment().format('YYYY-MM-DD HH:mm:ss');
            const reviewdata = {
                user_id: req.body.user_id,
                review_rating: reviewData.review_rating,
                review_content: reviewData.review_content,
                review_modified_date,
            }
            await productModel.updateReview(reviewdata, review_id);
            res.status(200).json('수정이 완료되었습니다.');
        } catch (err) {
            throw err;
        }
    },

    // 굿즈 리뷰 삭제
    deleteReview: async (req, res) => {
        try {
            const review_id = req.params.review_id;
            await productModel.deleteReview(review_id);
            res.status(200).json('삭제가 완료되었습니다.');
        } catch (err) {
            throw err;
        }
    }
}

module.exports = { productController }