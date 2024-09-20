const db = require('../config/mysqlDatabase');

const search_funding_query = "SELECT * FROM funding"
const imagesByFundingId_query = "SELECT * FROM funding_img WHERE funding_id = ?"
const imagesByitemId_query = "SELECT * FROM funding_img WHERE funding_id = ?"
const search_fundingId_query = "SELECT * FROM funding WHERE funding_id = ?"
const userNameByFunding_query = "SELECT * FROM funding WHERE user_name = ?"
const search_fundingItem_query = "SELECT * FROM funding_item WHERE funding_id = ?"
const select_fundingItem_query = "SELECT * FROM funding_item WHERE item_id = ?"
const search_listByFunding_query = "SELECT * FROM payment_details WHERE funding_id = ?"
const search_listByItem_query = "SELECT * FROM payment_details WHERE item_id = ?"
const search_listByUser_query = "SELECT * FROM payment_details WHERE user_name = ?"
const check_bookmark_query = "SELECT * FROM BookMark WHERE user_name = ? AND funding_id = ?"

const insert_funding_query = "INSERT INTO funding SET ?"
const insert_fundingImg_query = "INSERT INTO funding_img (funding_id, image) VALUES (?, ?)";
const insert_item_query = "INSERT INTO funding_item SET ?"
const insert_itemImg_query = "INSERT INTO funding_img (item_id, image) VALUES (?, ?)"
const create_fundingList_query = "INSERT INTO funding_list SET ?"
const create_bookmark_query = "INSERT INTO BookMark (user_name, funding_id) VALUES (?, ?)"

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
                else resolve(result[0]);
            })
        })
    },

    fundingByUser: (userName) => {
        return new Promise((resolve, reject) => {
            db.query(userNameByFunding_query, userName, (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            })
        })
    },

    createFundingList: (payRequestData) => {
        return new Promise((resolve, reject) => {
            db.query(create_fundingList_query, payRequestData, (err, result) => {
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

    searchItem: (itemId) => {
        return new Promise((resolve, reject) => {
            db.query(search_fundingItem_query, itemId, (err, result) => {
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