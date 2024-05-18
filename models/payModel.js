const db = require('../config/mysqlDatabase');

const pay_request_query = 'INSERT INTO payment_details SET ?';

const payModel = {
    payRequest : (payRequestData) => {
        return new Promise((resolve, reject) => {
            db.query(pay_request_query, payRequestData, (err, result) => {
                if(err) reject(err); 
                else resolve(result[0]);
            });
        })
    },
}

module.exports = payModel;