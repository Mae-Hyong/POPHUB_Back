const db = require('../config/mysqlDatabase');

const insert_achieveHub_query = "INSERT INTO achieve_hub (user_name, achieve_id) VALUES (?, ?)";

const select_achieveHub_query = 'SELECT * FROM achieve_hub WHERE user_name = ? AND achieve_id = ?';
const count_mark_query = 'SELECT COUNT(*) AS markCount FROM BookMark WHERE user_name = ?';
const joinDate_count_query = `
    SELECT uj.user_id, ui.user_name 
    FROM user_join_info uj 
    INNER JOIN user_info ui ON uj.user_id = ui.user_id
    WHERE uj.user_id = ? AND DATEDIFF(NOW(), uj.join_date) >= 10`;


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

    countBookMark: async (userName) => {
        return new Promise((resolve, reject) => {
            db.query(count_mark_query, userName, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            })
        })
    },

    checkAndAddAchieve: (userId) => {
        return new Promise((resolve, reject) => {
            db.query(joinDate_count_query, [userId], (err, result) => {
                if (err) return reject(err);
                if (result.length > 0) {
                    const { user_name } = result[0];
                    db.query(insert_achieveHub_query, [user_name, 9], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                } else {
                    resolve(null);
                }
            });
        });
    }
}

module.exports = achieveModel;