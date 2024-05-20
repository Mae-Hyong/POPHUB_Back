const db = require('../config/mysqlDatabase');

// ------- GET Query -------
const allProducts_query = 'SELECT p.*, GROUP_CONCAT(pi.image_url) AS image_urls FROM products p LEFT JOIN product_images pi ON p.product_id = pi.product_id GROUP BY p.product_id';
const userNameCheck_query = 'SELECT user_name FROM popup_stores WHERE store_id = ?';
const storeProducts_query = 'SELECT p.*, GROUP_CONCAT(pi.image_url) AS image_urls FROM products p LEFT JOIN product_images pi ON p.product_id = pi.product_id WHERE p.store_id = ? GROUP BY p.product_id';
const getProduct_query = 'SELECT p.*, GROUP_CONCAT(pi.image_url) AS image_urls FROM products p LEFT JOIN product_images pi ON p.product_id = pi.product_id WHERE p.product_id = ? GROUP BY p.product_id';

// ------- POST Query -------
const createProduct_query = 'INSERT INTO products SET ?';
const createImage_query = 'INSERT INTO product_images (product_id, image_url) VALUES (?, ?)';

// ------- PUT Query -------
const updateViewCount_query = 'UPDATE products SET product_view_count = product_view_count + 1 WHERE product_id = ?';
const updateProduct_query = 'UPDATE products SET ? WHERE product_id = ?'
const updateOrder_query = 'UPDATE products SET remaining_quantity = remaining_quantity - 1 WHERE product_id = ?';

// ------- DELETE Query -------
const deleteImage_query = 'DELETE FROM product_images WHERE product_id = ?';
const deleteProduct_query = 'DELETE FROM products WHERE product_id = ?';

const productModel = {

    // 모든 굿즈 정보 조회
    allProducts: async () => {
        try {
            const results = await new Promise((resolve, reject) => {
                db.query(allProducts_query, (err, results) => {
                    if (err) reject(err);
                    if (results.length === 0) {
                        return '상품이 존재하지 않습니다.';
                    } else {
                        results.forEach(result => {
                            if (result.image_urls) {
                                result.imageUrls = result.image_urls.split(',');
                                delete result.image_urls;
                            } else {
                                result.imageUrls = [];
                            }
                        });
                        resolve(results);
                    }
                });
            });
            return results;

        } catch (err) {
            throw err;
        }
    },

    // 스토어별 굿즈 조회
    storeProducts: async (store_id) => {
        try {
            const results = await new Promise((resolve, reject) => {
                db.query(storeProducts_query, store_id, (err, results) => {
                    if (err) reject(err);
                    if (!results || results.length === 0) {
                        resolve("해당 스토어의 굿즈가 없네요!");
                    } else {
                        results.forEach(result => {
                            if (result.image_urls) {
                                result.imageUrls = result.image_urls.split(',');
                                delete result.image_urls;
                            } else {
                                result.imageUrls = [];
                            }
                        });
                        resolve(results);
                    }
                });
            });
            return results;
        } catch (err) {
            throw err;
        }
    },

    // 굿즈 생성
    createProduct: async (productData, user_name) => {
        try {
            const check = await new Promise((resolve, reject) => {
                db.query(userNameCheck_query, [productData.store_id], (err, results) => {
                    if (err) return reject(err);
                    if (results.length === 0 || results[0].user_name !== user_name) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
            });

            if (check === true) {
                await new Promise((resolve, reject) => {
                    db.query(createProduct_query, productData, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
            }
            return check;
        } catch (err) {
            throw err;
        }
    },

    // 굿즈 이미지 등록
    uploadImage: async (product_id, imagePath) => {
        try {

            const result = await new Promise((resolve, reject) => {
                db.query(createImage_query, [product_id, imagePath], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            return result;
        } catch (err) {
            throw err;
        }
    },


    // 하나의 굿즈 정보 조회
    getProduct: async (product_id) => {
        try {
            const result = await new Promise((resolve, reject) => {
                db.query(updateViewCount_query, product_id, (err, result) => {
                    if (err) reject(err);
                    else {
                        db.query(getProduct_query, product_id, (err, results) => {
                            if (err) reject(err);
                            else {
                                results.forEach(result => {
                                    if (result.image_urls) {
                                        result.imageUrls = result.image_urls.split(',');
                                        delete result.image_urls;
                                    } else {
                                        result.imageUrls = [];
                                    }
                                });
                                resolve(results);
                            }
                        });
                    }
                })
                
            });
            return result;
        } catch (err) {
            throw err;
        }
    },

     // 굿즈 수정
    updateProduct: async (productData, user_name) => {
        try {
            const check = await new Promise((resolve, reject) => {
                db.query(userNameCheck_query, [productData.store_id], (err, results) => {
                    if (err) return reject(err);
                    if (results.length === 0 || results[0].user_name !== user_name) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
            });

            if (check === true) {
                await new Promise((resolve, reject) => {
                    db.query(updateProduct_query, [productData, productData.product_id], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    })
                })
            }

            return check;
        } catch (err) {
            throw err;
        }
    },

    

    // (수정 삭제시 사용) 이미지 삭제
    deleteImage: async (product_id) => {
        try {
            await new Promise((resolve, reject) => {
                db.query(deleteImage_query, product_id, (err, result) => {
                    if (err) reject(err);
                    else resolve();
                })
            })
        } catch (err) {
            throw err;
        }
    },

    // 굿즈 삭제
    deleteProduct: async (product_id) => {
        try {
            await new Promise((resolve, reject) => {
                db.query(deleteProduct_query, product_id, (err, result) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        } catch (err) {
            throw err;
        }
    },

    // 주문
    orderProduct: async (product_id) => {
        try {
            await new Promise((resolve, reject) => {
                db.query(updateOrder_query, product_id, (err, result) => {
                    if (err) reject(err);
                    else resolve();
                })
            })
        } catch (err) {
            throw err;
        }
    },

    productReview: async (product_id) => { // 특정 굿즈 리뷰 조회
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
                    if (err) reject(err);
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