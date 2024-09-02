const db = require('../config/mysqlDatabase');

// ------- GET Query -------
const showAddress_query = 'SELECT * FROM user_address WHERE user_name = ?';
const showUserAllDelivery_query = 'SELECT * FROM delivery WHERE user_name = ?';
const showUserDelivery_query = 'SELECT * FROM delivery WHERE user_name = ? AND status = ?';
const showPresidentAllDelivery_query = 'SELECT * FROM delivery WHERE store_id = ?';
const showPresidentDelivery_query = 'SELECT * FROM delivery WHERE store_id = ? AND status = ?';
// ------- POST Query -------
const createAddress_query = 'INSERT INTO user_address SET ?';
const createDelivery_query = 'INSERT INTO delivery SET ?';

// ------- PUT Query -------
const updateAddress_query = 'UPDATE user_address SET address = ? WHERE address_id = ?';
const cancelDelivery_query = 'UPDATE delivery SET status = "주문 취소", cancel_reason = ? WHERE delivery_id = ?';
const changeStatusDelivery_query = 'UPDATE delivery SET status = ? WHERE delivery_id = ?';
// ------- DELETE Query -------
const deleteAddress_query = 'DELETE FROM user_address WHERE address_id = ?';

const deliveryModel = {

    // 주소 조회
    showAddress: async (user_name) => {
        try {
            const result = await new Promise((resolve, reject) => {
                db.query(showAddress_query, user_name, (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });
            return result;
        } catch (err) {
            throw err;
        }
    },

    // 주소 등록
    createAddress: async (addressData) => {
        try {
            await new Promise((resolve, reject) => {
                db.query(createAddress_query, addressData, (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });
        } catch (err) {
            throw err;
        }
    },

    // 주소 수정
    updateAddress: async (address, address_id) => {
        try {
            await new Promise((resolve, reject) => {
                db.query(updateAddress_query, [address, address_id], (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });
        } catch (err) {
            throw err;
        }
    },

    // 주소 삭제
    deleteAddress: async (address_id) => {
        try {
            await new Promise((resolve, reject) => {
                db.query(deleteAddress_query, [address_id], (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });
        } catch (err) {
            throw err;
        }
    },

    // 주소 찾기
    getAddress: async (address_id) => {
        try {
            const getAddress_query = 'SELECT address FROM user_address WHERE address_id = ?';
            const result = await new Promise((resolve, reject) => {
                db.query(getAddress_query, [address_id], (err, results) => {
                    if (err) reject(err);
                    resolve(results[0].address);
                });
            });
            return result;
        } catch (err) {
            throw err;
        }
    },

    // 배송 주문 생성
    createDelivery: async (deliveryData) => {
        try {
            await new Promise((resolve, reject) => {
                db.query(createDelivery_query, deliveryData, (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });
        } catch (err) {
            throw err;
        }
    },

    // 배송 주문 취소
    cancelDelivery: async (cancel_reason, delivery_id) => {
        try {
            await new Promise((resolve, reject) => {
                db.query(cancelDelivery_query, [cancel_reason, delivery_id], (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });
        } catch (err) {
            throw err;
        }
    },

    // 배송 주문 조회 - 유저
    statusUserDelivery: async (user_name, status) => {
        try {
            let result;
            if (status == '전체') {
                result = await new Promise((resolve, reject) => {
                    db.query(showUserAllDelivery_query, user_name, (err, results) => {
                        if (err) reject(err);
                        resolve(results);
                    });
                });
            } else {
                result = await new Promise((resolve, reject) => {
                    db.query(showUserDelivery_query, [user_name, status], (err, results) => {
                        if (err) reject(err);
                        resolve(results);
                    });
                });
            }
            return result;
        } catch (err) {
            throw err;
        }
    },

    // 스토어 & 상품 유무 확인
    getProducts: async (user_name, store_id) => {
        try {
            const query = 'SELECT * FROM popup_stores WHERE user_name = ? AND store_id = ?';
            const storeExists = await new Promise((resolve, reject) => {
                db.query(query, [user_name, store_id], (err, results) => {
                    if (err) reject(err);
                    resolve(results.length > 0); //true or false
                });
            });

            const productCheckQuery = 'SELECT * FROM products WHERE store_id = ?';
            const productExists = await new Promise((resolve, reject) => {
                db.query(productCheckQuery, [store_id], (err, results) => {
                    if (err) reject(err);
                    resolve(results.length > 0);
                });
            });

            if (storeExists && productExists) {
                const productQuery = 'SELECT * FROM delivery WHERE store_id = ?';
                const products = await new Promise((resolve, reject) => {
                    db.query(productQuery, [store_id], (err, results) => {
                        if (err) reject(err);
                        resolve(results);
                    });
                });

                return products;
            } else if (!storeExists) {
                return { message: "일치하는 팝업 스토어가 없습니다." }; // store_id가 없을 때
            } else if (!productExists) {
                return { message: "등록된 상품이 없습니다." }; // 상품이 없을 경우
            }
        } catch (err) {
            throw err;
        }
    },

    // 배송 주문 조회 - 판매자
    statusPresidentDelivery: async (store_id, status) => {
        let result;
        try {
            let result;
            if (status == '전체') {
                result = await new Promise((resolve, reject) => {
                    db.query(showPresidentAllDelivery_query, store_id, (err, results) => {
                        if (err) reject(err);
                        resolve(results);
                    });
                });
            } else {
                result = await new Promise((resolve, reject) => {
                    db.query(showPresidentDelivery_query, [store_id, status], (err, results) => {
                        if (err) reject(err);
                        resolve(results);
                    });
                });
            }
            return result;
        } catch (err) {
            throw err;
        }
    },


    // 배송 상태 변경
    changeStatusDelivery: async (status, delivery_id) => {
        try {
            await new Promise((resolve, reject) => {
                db.query(changeStatusDelivery_query, [status, delivery_id], (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });
        } catch (err) {
            console.log(err);
            throw err;
        }
    },

}

module.exports = deliveryModel;