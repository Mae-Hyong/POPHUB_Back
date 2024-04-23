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
                    if(err) reject(err);
                    else resolve(result);
                });
            });
            const product_id = result.insertId;
            return { ...productData, product_id };
            
        } catch (err) {
            throw err;
        }

    }
}

module.exports = productModel;