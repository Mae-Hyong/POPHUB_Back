const db = require('../config/mysqlDatabase');

const search_funding_query = "SELECT * FROM funding"
const imagesByFundingId_query = "SELECT * FROM funding_img WHERE funding_id = ?"
const imagesByitemId_query = "SELECT * FROM funding_img WHERE funding_id = ?"
const search_fundingId_query = "SELECT * FROM funding WHERE funding_id = ?"
const userNameByFunding_query = "SELECT * FROM funding WHERE user_name = ?"
const search_fundingItem_query = "SELECT * FROM funding_item WHERE funding_id = ?"
const select_fundingItem_query = "SELECT * FROM funding_item WHERE item_id = ?"

const insert_funding_query = "INSERT INTO funding SET ?"
const insert_fundingImg_query = "INSERT INTO funding_img (funding_id, image) VALUES (?, ?)";
const insert_item_query = "INSERT INTO funding_item SET ?"
const insert_itemImg_query = "INSERT INTO funding_img (item_id, image) VALUES (?, ?)"
const create_fundingList_query = "INSERT INTO funding_list SET ?"

const update_donation_query = "UPDATE funding SET donation = donation + ? WHERE funding_id = ?;"

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
}

module.exports = fundingModel;