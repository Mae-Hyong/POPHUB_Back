const achieveModel = require('../models/achieveModel');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel')
const { v4: uuidv4 } = require("uuid");

const productController = {

    // 모든 굿즈 조회
    allProducts: async (req, res) => {
        try {
            const result = await productModel.allProducts();
            res.status(200).json(result);
        } catch (err) {
            res.status(500).send("오류가 발생하였습니다.");
        }
    },

    // 스토어별 굿즈 조회
    storeProducts: async (req, res) => {
        try {
            const storeId = req.params.storeId;
            const result = await productModel.storeProducts(storeId);
            res.status(200).json(result);
        } catch (err) {
            res.status(500).send("오류가 발생하였습니다.");
        }
    },

    // 굿즈 생성
    createProduct: async (req, res) => {
        try {
            const productId = uuidv4();
            const body = req.body;
            const storeId = req.params.storeId;
            const productData = {
                product_id: productId,
                store_id: storeId,
                product_name: body.productName,
                product_price: body.productPrice,
                product_description: body.productDescription,
                remaining_quantity: body.remainingQuantity,
            }

            const check = await productModel.createProduct(productData, body.userName);
            if (check === false) {
                res.status(400).json({ error: '유저 닉네임이 일치하지 않습니다.' });
            } else {
                let productImages = [];
                if (req.files) {
                    await Promise.all(req.files.map(async (file) => {
                        productImages.push(file.location);
                        await productModel.uploadImage(productId, file.location);
                    }));
                }
                res.status(201).json('해당 상품이 등록되었습니다.');
            }

        } catch (err) {
            res.status(500).send("오류가 발생하였습니다.");
        }
    },

    // 특정 굿즈 상세 조회
    getProduct: async (req, res) => {
        try {
            const productId = req.params.productId;
            const userName = req.params.userName || null;
            const result = await productModel.getProduct(productId, userName);
            res.status(200).json(result);
        } catch (err) {
            res.status(500).send("오류가 발생하였습니다.");
        }
    },

    // 굿즈 수정
    updateProduct: async (req, res) => {
        try {
            const productId = req.params.productId;
            const body = req.body;
            const updateData = {
                product_id: productId,
                product_name: body.productName,
                product_price: body.productPrice,
                product_description: body.productDescription,
                remaining_quantity: body.remainingQuantity,
            }
            const check = await productModel.updateProduct(updateData, body.userName);
            
            if (check === false) {
                res.status(400).json({ error: '유저 닉네임이 일치하지 않습니다.' });
            } else {
                await productModel.deleteImage(productId);
                let productImages = [];
                if (req.files) {
                    await Promise.all(req.files.map(async (file) => {
                        productImages.push(file.location);
                        await productModel.uploadImage(productId, file.location);
                    }));
                }
                res.status(200).json('해당 상품이 수정되었습니다.');
            }
        } catch (err) {
            res.status(500).send("오류가 발생하였습니다.");
        }
    },

    // 굿즈 삭제
    deleteProduct: async (req, res) => {
        try {
            const productId = req.params.productId;
            await productModel.deleteImage(productId);
            await productModel.deleteProduct(productId);
            res.status(200).json('해당 상품이 삭제되었습니다.');
        } catch (err) {
            res.status(500).send("오류가 발생하였습니다.");
        }
    },

    // 굿즈 찜
    likeProduct: async (req, res) => {
        try {
            const productId = req.params.productId;
            const userName = req.body.userName;
            const likeCount = await achieveModel.countBookMark(userName);
            if(likeCount == 10) {
                const achieve = await achieveModel.selectAchiveHub(userName, 3);

                if (!achieve) {
                    await achieveModel.clearAchieve(userName, 3);
                    const result = await achieveModel.selectAchive(3);
                    const insertData = {
                        user_name: userName,
                        points: result.points,
                        description: result.title,
                        calcul: "+"
                    }

                    await achieveModel.addedPoint(insertData);
                    await userModel.updateUserPoints(userName, result.points);
                }
            }
            const like = await productModel.likeProduct(userName, productId);
            res.status(201).json(like);
        } catch (err) {
            res.status(500).send("오류가 발생하였습니다.");
        }
    },

    // 유저별 찜 조회
    likeUser: async (req, res) => {
        try {
            const userName = req.params.userName;
            const result = await productModel.likeUser(userName);
            res.status(200).json(result);
        } catch (err) {
            res.status(500).send("사용자별 찜 조회 중 오류가 발생하였습니다.");
        }
    } 

    // // 주문
    // orderProduct: async (req, res) => {
    //     try {
    //         const productId = req.params.productId;
    //         const userName = req.body.userName;
    //         await productModel.orderProduct(productId);
    //         res.status(200).json('주문이 완료되었습니다.');
    //     } catch (err) {
    //         console.log(err);
    //         res.status(500).send("오류가 발생하였습니다.");
    //     }
    // },

    // // 특정 굿즈 리뷰
    // productReview: async (req, res) => {
    //     try {
    //         const productId = req.params.productId;
    //         const review = await (productModel.productReview(productId));
    //         res.status(200).json(review);
    //     } catch (err) {
    //         console.log(err);
    //         res.status(500).send("오류가 발생하였습니다.");
    //     }
    // },

    // // 굿즈 리뷰 상세 조회
    // productReviewDetail: async (req, res) => {
    //     try {
    //         const review_id = req.params.review_id;
    //         const reviewDetail = await productModel.productReviewDetail(review_id);
    //         res.status(200).json(reviewDetail);
    //     } catch (err) {
    //         console.log(err);
    //         res.status(500).send("오류가 발생하였습니다.");
    //     }
    // },

    // // 굿즈 리뷰 생성
    // createReview: async (req, res) => {
    //     try {
    //         const userName = req.body.userName;

    //         if (!userName) {
    //             return res.status(400).send("로그인 후 사용해주세요");
    //         }

    //         const productId = req.params.productId;
    //         const reviewData = req.body.reviewData;
    //         const review_date = moment().format('YYYY-MM-DD HH:mm:ss');
    //         const reviewdata = {
    //             userName,
    //             productId,
    //             review_rating: reviewData.review_rating,
    //             review_content: reviewData.review_content,
    //             review_date,
    //         }
    //         const allreview = await productModel.createReview(reviewdata);
    //         res.status(201).json(allreview);
    //     } catch (err) {
    //         console.log(err);
    //         res.status(500).send("오류가 발생하였습니다.");
    //     }
    // },

    // // 굿즈 리뷰 수정
    // updateReview: async (req, res) => {
    //     try {
    //         const userName = req.body.userName;
    //         if (!userName) {
    //             return res.status(400).send("로그인 후 사용해주세요");
    //         }

    //         const review_id = req.params.review_id;
    //         const reviewData = req.body.reviewData;
    //         const review_modified_date = moment().format('YYYY-MM-DD HH:mm:ss');
    //         const reviewdata = {
    //             userName,
    //             review_rating: reviewData.review_rating,
    //             review_content: reviewData.review_content,
    //             review_modified_date,
    //         }
    //         await productModel.updateReview(reviewdata, review_id);
    //         res.status(200).json('수정이 완료되었습니다.');
    //     } catch (err) {
    //         console.log(err);
    //         res.status(500).send("오류가 발생하였습니다.");
    //     }
    // },

    // // 굿즈 리뷰 삭제
    // deleteReview: async (req, res) => {
    //     try {
    //         const review_id = req.params.review_id;
    //         await productModel.deleteReview(review_id);
    //         res.status(200).json('삭제가 완료되었습니다.');
    //     } catch (err) {
    //         console.log(err);
    //         res.status(500).send("오류가 발생하였습니다.");
    //     }
    // }
}

module.exports = { productController }