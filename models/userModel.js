const db = require('../config/mysqlDatabase');

// ------- GET Query -------
const user_search_query = 'SELECT * FROM user_info WHERE user_id = ?';
const user_join_query = 'SELECT * FROM user_join_info WHERE user_id = ?';
const name_check_query = 'SELECT * FROM user_info WHERE user_name = ?';
const id_check_query = 'SELECT * FROM user_info WHERE user_id = ?';
const id_search_query = 'SELECT user_id From user_info WHERE phone_number = ?';
const inquiry_search_query = 'SELECT * FROM inquiry WHERE user_name = ?';
const inquiry_select_query = 'SELECT * FROM inquiry WHERE inquiry_id = ?';
const answer_search_query = 'SELECT * FROM answer WHERE inquiry_id = ?';
const search_category_query = 'SELECT category_name FROM category WHERE category_id = ?'
const search_points_query = 'SELECT * FROM point_history WHERE user_name = ?'

// ------- POST Query -------
const profile_add_query = 'INSERT INTO user_info (user_id, user_name, phone_number, gender, age, user_image) VALUES (?, ?, ?, ?, ?, ?)';
const inquiry_add_query = 'INSERT INTO inquiry (user_name, category_id, title, content, image) VALUES (?, ?, ?, ?, ?)';
const delete_add_query = 'INSERT INTO user_delete(user_id, phone_number) VALUES (?, ?)'
const gain_point_query = "INSERT INTO point_history SET ?";

// ------- UPDATE Query -------
const password_change_query = 'UPDATE user_join_info SET user_password = ? WHERE user_id = ?';
const name_change_query = 'UPDATE user_info SET user_name = ?  WHERE user_id = ?';
const image_change_query = 'UPDATE user_info SET user_image = ?  WHERE user_id = ?';
const delete_change_query = 'UPDATE user_info SET user_name = ?, withdrawal = ? WHERE user_id = ?'
const points_update_query = "UPDATE user_info SET point_score = point_score + ? WHERE user_name = ?"
const points_use_query = "UPDATE user_info SET points = points - ? WHERE user_name = ?"

// ------- DELETE Query -------
const user_delete_query = 'DELETE FROM user_join_info WHERE user_id = ?'

const userModel = {
    searchUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.query(user_search_query, userId, (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            });
        })
    },

    searchJoin: (userId) => {
        return new Promise((resolve, reject) => {
            db.query(user_join_query, userId, (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            });
        })
    },

    userDoubleCheck: (userId, userName) => {
        return new Promise((resolve, reject) => {
            if (!userId) {
                db.query(name_check_query, userName, (err, result) => {
                    if (err) reject(err);
                    else resolve(result[0]);
                });
            } else {
                db.query(id_check_query, userId, (err, result) => {
                    if (err) reject(err);
                    else resolve(result[0]);
                })
            }

        })
    },

    searchId: (phoneNumber) => {
        return new Promise((resolve, reject) => {
            db.query(id_search_query, phoneNumber, (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            });
        })
    },

    changePassword: (userId, userPassword) => {
        return new Promise((resolve, reject) => {
            db.query(password_change_query, [userPassword, userId], (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            });
        })
    },

    createProfile: (userId, userName, phoneNumber, Gender, age, userImage) => {
        return new Promise((resolve, reject) => {
            db.query(profile_add_query, [userId, userName, phoneNumber, Gender, age, userImage], (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            });
        })
    },

    updateName: (userId, userName) => {
        return new Promise((resolve, reject) => {
            db.query(name_change_query, [userName, userId], (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            });
        })
    },

    updateImage: (userId, userImage) => {
        return new Promise((resolve, reject) => {
            db.query(image_change_query, [userImage, userId], (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            });
        })
    },

    deleteData: (userId, phoneNumber) => {
        return new Promise((resolve, reject) => {
            db.query(delete_add_query, [userId, phoneNumber], (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            })
        })
    },

    deleteChange: (userName, status, userId) => {
        return new Promise((resolve, reject) => {
            db.query(delete_change_query, [userName, status, userId], (err, changeResult) => {
                if (err) reject(err);
                else resolve(changeResult[0]);
            })
        })
    },

    deleteUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.query(user_delete_query, userId, (err, deleteResult) => {
                if (err) reject(err);
                else resolve(deleteResult[0]);
            })
        })
    },

    createInquiry: (userName, categoryId, title, content, userImage) => {
        return new Promise((resolve, reject) => {
            db.query(inquiry_add_query, [userName, categoryId, title, content, userImage], (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            });
        })
    },

    searchInquiry: (userName) => {
        return new Promise((resolve, reject) => {
            db.query(inquiry_search_query, userName, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        })
    },

    selectInquiry: (inquiryId) => {
        return new Promise((resolve, reject) => {
            db.query(inquiry_select_query, inquiryId, (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            })
        })
    },

    searchAnswer: (inquiryId) => {
        return new Promise((resolve, reject) => {
            db.query(answer_search_query, inquiryId, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            })
        })
    },

    category: (categoryId) => {
        return new Promise((resolve, reject) => {
            db.query(search_category_query, categoryId, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            })
        })
    },



    gainPoint: (insertData) => {
        return new Promise((resolve, reject) => {
            db.query(gain_point_query, insertData, (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            })
        })
    },

    searchPoint: (userName) => {
        return new Promise((resolve, reject) => {
            db.query(search_points_query, userName, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            })
        })
    },

    updateUserPoints: (userName, points) => {
        return new Promise((resolve, reject) => {
            db.query(points_update_query, [points, userName], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    usePoints: (userName, points) => {
        return new Promise((resolve, reject) => {
            db.query(points_use_query, [points, userName], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },
}

module.exports = userModel;