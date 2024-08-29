const db = require('../config/mysqlDatabase');

// ------- GET Query -------
const showAddress_query = 'SELECT * FROM user_address WHERE user_name = ?';

// ------- POST Query -------
const createAddress_query = 'INSERT INTO user_address SET ?';

// ------- PUT Query -------
const updateAddress_query = 'UPDATE user_address SET address = ? WHERE address_id = ?';

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
                })
            })
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
                })
            })
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
                })
            })
        } catch (err) {
            throw err;
        }
    },

    // 주소 삭제
    deleteAddress: async(address_id) => {
        try {
            await new Promise((resolve, reject) => {
                db.query(deleteAddress_query, [address_id], (err, results) => {
                    if (err) reject (err);
                    resolve(results);
                })
            })
        } catch (err) {
            throw err;
        }
    }

}

module.exports = deliveryModel;