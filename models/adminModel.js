const db = require('../config/mysqlDatabase');

// ------- POST Query -------
const create_answer_query = 'INSERT INTO answer(inquiry_id, user_name, content) VALUES (?, ?, ?)'
const update_inquiry_query = 'UPDATE inquiry SET status = ? WHERE inquiry_id = ?'

const adminModel = {
    createAnswer : (inquiry_id, user_name, content) => {
        return new Promise((resolve, reject) => {
            db.query(create_answer_query, [inquiry_id, user_name, content], (err, result) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(result[0]);
                }
            });
        })
    },

    updateInquiry : (inquiry_id) => {
        return new Promise((resolve, reject) => {
            db.query(update_inquiry_query, ['complete', inquiry_id], (err, result) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(result[0]);
                }
            });
        })
    },
}

module.exports = adminModel;