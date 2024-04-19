const db = require('../config/mysqlDatabase');

const productModel = {
    allProducts: async () => {
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
}

module.exports = productModel;