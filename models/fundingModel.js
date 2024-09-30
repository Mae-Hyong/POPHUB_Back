const db = require('../config/mysqlDatabase');

const search_funding_query = "SELECT * FROM funding"
const imagesByFundingId_query = "SELECT * FROM funding_img WHERE funding_id = ?"
const imagesByitemId_query = "SELECT * FROM funding_img WHERE item_id = ?"
const search_fundingId_query = "SELECT * FROM funding WHERE funding_id = ?"
const userNameByFunding_query = "SELECT * FROM funding WHERE user_name = ?"
const search_fundingItem_query = "SELECT * FROM funding_item WHERE funding_id = ?"
const select_fundingItem_query = "SELECT * FROM funding_item WHERE item_id = ?"
const search_listByFunding_query = "SELECT * FROM payment_details WHERE funding_id = ?"
const search_listByItem_query = "SELECT * FROM payment_details WHERE item_id = ?"
const search_listByUser_query = "SELECT * FROM payment_details WHERE user_name = ?"
const search_support_query = "SELECT * FROM funding_support"
const check_bookmark_query = "SELECT * FROM BookMark WHERE user_name = ? AND funding_id = ?"
const search_supportByItem_query = "SELECT * FROM funding_support WHERE item_id = ?"
const search_supportByUser_query = "SELECT * FROM funding_support WHERE user_name = ?"
const search_supportById_query = "SELECT * FROM funding_support WHERE support_id = ?"

const insert_funding_query = "INSERT INTO funding SET ?"
const insert_fundingImg_query = "INSERT INTO funding_img (funding_id, image) VALUES (?, ?)";
const insert_item_query = "INSERT INTO funding_item SET ?"
const insert_itemImg_query = "INSERT INTO funding_img (item_id, image) VALUES (?, ?)"
const create_bookmark_query = "INSERT INTO BookMark (user_name, funding_id) VALUES (?, ?)"
const create_fundingSupport_query = "INSERT INTO funding_support SET ?"

const update_donation_query = "UPDATE funding SET donation = donation + ? WHERE funding_id = ?;"

const delete_bookmark_query = "DELETE FROM BookMark WHERE user_name = ? AND funding_id = ?"

const fundingModel = {
    createFunding: (fundingData) => {
        return new Promise((resolve, reject) => {
            db.query(insert_funding_query, fundingData, (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            })
        })
    },

    fundingImg: (fundingId, image) => {
        return new Promise((resolve, reject) => {
            db.query(insert_fundingImg_query, [fundingId, image], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    createItem: (itemData) => {
        return new Promise((resolve, reject) => {
            db.query(insert_item_query, itemData, (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            })
        })
    },

    itemImg: (itemId, image) => {
        return new Promise((resolve, reject) => {
            db.query(insert_itemImg_query, [itemId, image], (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            })
        })
    },

    searchFunding: () => {
        return new Promise((resolve, reject) => {
            db.query(search_funding_query, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            })
        })
    },

    imagesByFundingId: (fundingId) => {
        return new Promise((resolve, reject) => {
            db.query(imagesByFundingId_query, fundingId, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            })
        })
    },

    imagesByitemId: (itemId) => {
        return new Promise((resolve, reject) => {
            db.query(imagesByitemId_query, itemId, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            })
        })
    },

    fundingById: (fundingId) => {
        return new Promise((resolve, reject) => {
            db.query(search_fundingId_query, fundingId, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            })
        })
    },

    fundingByUser: (userName) => {
        return new Promise((resolve, reject) => {
            db.query(userNameByFunding_query, userName, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            })
        })
    },

    createFundingSupport: (insertData) => {
        return new Promise((resolve, reject) => {
            db.query(create_fundingSupport_query, insertData, (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            })
        })
    },

    searchItemByFunding: (fundingId) => {
        return new Promise((resolve, reject) => {
            db.query(search_fundingItem_query, fundingId, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            })
        })
    },

    selectItem: (itemId) => {
        return new Promise((resolve, reject) => {
            db.query(select_fundingItem_query, itemId, (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            })
        })
    },

    updatedonation: (totalAmount, fundingId) => {
        return new Promise((resolve, reject) => {
            db.query(update_donation_query, [totalAmount, fundingId], (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            })
        })
    },

    searchListByFunding: (fundingId) => {
        return new Promise((resolve, reject) => {
            db.query(search_listByFunding_query, fundingId, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            })
        })
    },

    searchListByItem: (itemId) => {
        return new Promise((resolve, reject) => {
            db.query(search_listByItem_query, itemId, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            })
        })
    },

    searchListByUser: (userName) => {
        return new Promise((resolve, reject) => {
            db.query(search_listByUser_query, userName, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            })
        })
    },

    searchSupport: () => {
        return new Promise((resolve, reject) => {
            db.query(search_support_query, itemId, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            })
        })
    },

    supportByItem: (itemId) => {
        return new Promise((resolve, reject) => {
            db.query(search_supportByItem_query, itemId, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            })
        })
    },

    supportByUser: (userName) => {
        return new Promise((resolve, reject) => {
            db.query(search_supportByUser_query, userName, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            })
        })
    },

    supportById: (supportId) => {
        return new Promise((resolve, reject) => {
            db.query(search_supportById_query, supportId, (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            })
        })
    },

    checkBookMark: (userName, fundingId) => {
        return new Promise((resolve, reject) => {
            db.query(check_bookmark_query, [userName, fundingId], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            })
        })
    },

    deleteBookMark: (userName, fundingId) => {
        return new Promise((resolve, reject) => {
            db.query(delete_bookmark_query, [userName, fundingId], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            })
        })
    },

    createBookMark: (userName, fundingId) => {
        return new Promise((resolve, reject) => {
            db.query(create_bookmark_query, [userName, fundingId], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            })
        })
    },
}

module.exports = fundingModel;