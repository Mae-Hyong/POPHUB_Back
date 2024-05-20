const db = require('../config/mysqlDatabase');

const pay_request_query = 'INSERT INTO payment_details SET ?';
const payments_query = 'INSERT INTO payments SET ?';
const update_payments_query = 'UPDATE payments SET status = ?, aid = ? WHERE payment_id = ?';

const payModel = {
    payRequest : (payRequestData) => {
        return new Promise((resolve, reject) => {
            db.query(pay_request_query, payRequestData, (err, result) => {
                if(err) reject(err); 
                else resolve(result[0]);
            });
        })
    },

    payments : (paymentsData) => {
        return new Promise((resolve, reject) => {
            db.query(payments_query, paymentsData, (err, result) => {
                if(err) reject(err); 
                else resolve(result[0]);
            })
        })
    },

    updatePayments : (paymentId, aid) => {
        return new Promise((resolve, reject) => {
            db.query(update_payments_query, ['approved', aid, paymentId], (err, result) => {
                if(err) reject(err); 
                else resolve(result[0]);
            });
        })
    },
}

module.exports = payModel;