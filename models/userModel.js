const db = require('../config/mysqlDatabase');
const { search } = require('../router/userRouter');
//const { userDoubleCheck } = require('../service/userService');

// ------- GET Query -------
const user_search_query = 'SELECT * FROM user_info WHERE user_id = ?';
const name_search_query = 'SELECT * FROM user_info WHERE user_name = ? OR user_id = ?';
const inquiry_search_query = 'SELECT * FROM inquiry WHERE user_name = ?';
const id_search_query = 'SELECT user_id From user_info WHERE phone_number = ?';

// ------- POST Query -------
const password_change_query = 'UPDATE user_join_info SET user_password = ? WHERE user_id = ?';
const profile_add_query = 'INSERT INTO user_info (user_id, user_name, phone_number, gender, age, user_image) VALUES (?, ?, ?, ?, ?, ?)';
const profile_change_query = 'UPDATE user_info SET user_name, user_image  WHERE user_id = ?';
const inquiry_add_query = 'INSERT INTO inquiry (user_name, category_id, title, content) VALUES (?, ?, ?, ?)';

const userModel = {
    searchUser : (userId) => {
        return new Promise((resolve, reject) => {
            db.query(user_search_query, userId, (err, result) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(result[0]);
                }
            });
        })
    },

    userDoubleCheck : (userDate) => {
        return new Promise((resolve, reject) => {
            db.query(name_search_query, userDate, (err, result) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(result[0]);
                }
            });
        })
    },

    searchId : (phoneNumber) => {
        return new Promise((resolve, reject) => {
            db.query(id_search_query, phoneNumber, (err, result) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(result[0]);
                }
            });
        })
    },

    changePassword : (userId, userPassword) => {
        return new Promise((resolve, reject) => {
            db.query(password_change_query, [userPassword, userId], (err, result) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(result[0]);
                }
            });
        })
    },

    createProfile : (userId, userName, phoneNumber, Gender, Age, userImage) => {
        return new Promise((resolve, reject) => {
            db.query(profile_add_query, [userId, userName, phoneNumber, Gender, Age, userImage], (err, result) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(result[0]);
                }
            });
        })
    },

    updateProfile : (userId, userName, userImage) => {
        return new Promise((resolve, reject) => {
            db.query(profile_change_query, [userName, userImage, userId], (err, result) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(result[0]);
                }
            });
        })
    },

    createInquiry : (userName, categoryId, title, content) => {
        return new Promise((resolve, reject) => {
            db.query(inquiry_add_query, [userName, categoryId, title, content], (err, result) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(result[0]);
                }
            });
        })
    },

    searchInquiry : (userName) => {
        return new Promise((resolve, reject) => {
            db.query(inquiry_search_query, [userName], (err, result) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(result[0]);
                }
            });
        })
    },
}

module.exports = userModel;