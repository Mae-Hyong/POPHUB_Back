const db = require('../config/mysqlDatabase');

const pay_request_query = 'INSERT INTO payment_details SET ?';
const payments_query = 'INSERT INTO payments SET ?';
const update_payments_query = 'UPDATE payments SET status = ?, aid = ? WHERE partner_order_id = ?';
const search_order_query = 'SELECT tid FROM payments WHERE partner_order_id = ?'

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

    updatePayments : (partnerOrderId, aid) => {
        return new Promise((resolve, reject) => {
            db.query(update_payments_query, ['approved', aid, partnerOrderId], (err, result) => {
                if(err) reject(err); 
                else resolve(result[0]);
            });
        })
    },

    searchOrder : (partnerOrderId) => {
        return new Promise((resolve, reject) => {
            db.query(search_order_query, partnerOrderId, (err, result) => {
                if(err) reject(err); 
                else resolve(result[0]);
            });
        })
    },
}

module.exports = payModel;