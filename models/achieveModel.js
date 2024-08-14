const db = require('../config/mysqlDatabase');

const select_achieveHub_query = 'SELECT * FROM achieve_hub WHERE user_name = ? AND achieve_id = ?'
const insert_achieveHub_query = "INSERT INTO inquiry (user_name, achieve_id) VALUES (?, ?)"
const count_review_query = 'SELECT COUNT(*) AS reviewCount FROM store_review WHERE user_name = ?';

const achieveModel = {
    clearAchieve: async (userName, achieveId) => {
        return new Promise((resolve, reject) => {
            db.query(insert_achieveHub_query, [userName, achieveId], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            })
        })
    },

    searchAchiveHub: async (achieveId) => {
        return new Promise((resolve, reject) => {
            db.query(select_achieveHub_query, achieveId, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            })
        })
    },

    countReview: async (userName) => {
        return new Promise((resolve, reject) => {
            db.query(count_review_query, userName, (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            })
        })
    }
}

module.exports = achieveModel;