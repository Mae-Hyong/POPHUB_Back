const db = require('../config/mysqlDatabase');

const search_userWait_query = 'SELECT * FROM wait_list WHERE user_name = ?';
const search_storeWait_query = 'SELECT * FROM wait_list WHERE store_id = ?';
const waitPosition_query = 'SELECT *, (SELECT COUNT(*) FROM wait_list AS wl WHERE wl.store_id = wait_list.store_id AND wl.status = "waiting" AND wl.created_at <= wait_list.created_at) AS position FROM wait_list WHERE user_name = ? AND store_id = ? AND status = "waiting" ORDER BY created_at ASC';
const insert_wait_query = 'INSERT INTO wait_list SET ?';
const insert_stand_query = 'INSERT INTO stand_store(user_name, store_id) VALUES (?, ?)';
const admission_wait_query = 'UPDATE wait_list SET status = ? WHERE user_name = ? AND store_id = ?';


const delete_wait_query = 'DELETE FROM wait_list WHERE user_name = ? AND store_id = ?';

const reservationModel = {
    searchUserWait: (userName) => {
        return new Promise((resolve, reject) => {
            db.query(search_userWait_query, userName, async (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            });
        });
    },

    searchStoreWait: (storeId) => {
        return new Promise((resolve, reject) => {
            db.query(search_storeWait_query, storeId, async (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            });
        });
    },

    createWaitList: (insertData) => {
        return new Promise((resolve, reject) => {
            db.query(insert_wait_query, insertData, async (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            });
        });
    },

    admissionWaitList: (user_name, storeId) => {
        return new Promise((resolve, reject) => {
            db.query(admission_wait_query, ['completed', user_name, storeId], async (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            });
        });
    },

    createStand: (insertData) => {
        return new Promise((resolve, reject) => {
            db.query(insert_stand_query, [insertData.user_name, insertData.store_id], async (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            });
        });
    },

    searchUserStoreWait: (userName, storeId) => {
        return new Promise((resolve, reject) => {
            db.query(waitPosition_query, [userName, storeId], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    },

    cancelWaitList: (userName, storeId) => {
        return new Promise((resolve, reject) => {
            db.query(delete_wait_query, [userName, storeId], async (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            });
        });
    },
};

module.exports = reservationModel;
