const db = require('../config/mysqlDatabase');

const productModel = {
    allProducts: async () => { // 모든 상품 정보 확인
        try {
            const results = await new Promise((resolve, reject) => {
                db.query('SELECT * FROM products', (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });
            return results;
        } catch (err) {
            throw err;
        }
    },

    createProduct: async (productData) => { // 상품 생성
        try {
            const result = await new Promise((resolve, reject) => {
                db.query('INSERT INTO products SET ?', productData, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            const product_id = result.insertId;
            return { ...productData, product_id };

        } catch (err) {
            throw err;
        }
    },

    getProduct: async (store_name) => { // 특정 팝업 스토어 굿즈 조회
        try {
            const result = await new Promise((resolve, reject) => {
                db.query('SELECT store_id FROM popup_stores WHERE store_name = ?', store_name, (err, result) => {
                    resolve(result[0]);
                })

            })

            if (result) {
                const store_id = result.store_id;
                const products = await new Promise((resolve, reject) => {
                    db.query('SELECT * FROM products WHERE store_id = ?', store_id, (err, products) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(products);
                        }
                    });
                });
                return products;
            }
        } catch (err) {
            throw err;
        }
    },

    storeProductDetail: async (product_id) => { // 굿즈 상세 조회
        try {
            const result = await new Promise((resolve, reject) => {
                db.query('SELECT * FROM products WHERE product_id = ?', product_id, (err, result) => {
                    if (err) reject(err);
                    resolve(result[0]);
                });
            });
            return result;
        } catch (err) {
            throw err;
        }
    },


    updateProduct: async (product_id, productData) => { // 굿즈 수정
        try {
            await new Promise((resolve, reject) => {
                db.query('UPDATE products SET ? WHERE product_id = ?', [productData, product_id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                })
            })
        } catch (err) {
            throw err;
        }
    },

    deleteProduct: async (product_id) => { // 굿즈 삭제
        try {
            await new Promise((resolve, reject) => {
                db.query('DELETE FROM products WHERE product_id = ?', product_id, (err, result) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        } catch (err) {
            throw err;
        }
    },

    productReview: async (product_id) => { // 특정 굿즈 조회
        try {
            const results = await new Promise((resolve, reject) => {
                db.query('SELECT * FROM product_review WHERE product_id = ?', product_id, (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });
            return results;
        } catch (err) {
            throw err;
        }
    },

    productReviewDetail: async (review_id) => { // 특정 굿즈 리뷰 상세 조회
        try {
            const result = await new Promise((resolve, reject) => {
                db.query('SELECT * FROM product_review WHERE review_id = ?', review_id, (err, result) => {
                    if(err) reject(err);
                    resolve(result[0]);
                });
            });
            return result;
        } catch (err) {
            throw err;
        }
    },

    createReview: async (reviewdata) => { // 굿즈 리뷰 생성
        try {
            const result = await new Promise((resolve, reject) => {
                db.query('INSERT INTO product_review SET ?', reviewdata, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });

            const review_id = result.insertId;
            return { ...reviewdata, review_id };
        } catch (err) {
            throw err;
        }
    },

    updateReview: async (reviewdata, review_id) => { // 굿즈 리뷰 수정
        try {
            await new Promise((resolve, reject) => {
                db.query('UPDATE product_review SET ?  WHERE review_id = ?', [reviewdata, review_id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            return reviewdata;
        } catch (err) {
            throw err;
        }
    },

    deleteReview: async (review_id) => { // 굿즈 리뷰 삭제
        try {
            await new Promise((resolve, reject) => {
                db.query('DELETE FROM product_review WHERE review_id = ?', review_id, (err, result) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        } catch (err) {
            throw err;
        }
    }
}

module.exports = productModel;