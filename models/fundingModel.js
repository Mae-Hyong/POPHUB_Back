const db = require('../config/mysqlDatabase');

const search_funding_query = "SELECT * FROM funding"
const imagesByFundingId_query = "SELECT * FROM funding_img WHERE funding_id = ?"
const search_fundingId_query = "SELECT * FROM funding WHERE funding_id = ?"
const userNameByFunding_query = "SELECT * FROM funding WHERE user_name = ?"
const search_fundingItem_query = "SELECT * FROM funding_item WHERE funding_id = ?"
const select_fundingItem_query = "SELECT * FROM funding_item WHERE item_id = ?"

const insert_funding_query = "INSERT INTO funding SET ?"
const insert_fundingImg_query = "INSERT INTO funding_img SET ?"
const insert_item_query = "INSERT INTO funding_item SET ?"
const insert_itemImg_query = "INSERT INTO funding_img SET ?"
const create_fundingList_query = "INSERT INTO funding_list (funding_id, item_id, partner_order_id, user_name, count) VALUES (?, ?, ?, ?, ?)"

const fundingModel = {
    createFunding: (fundingData) => {
        return new Promise ((resolve, reject) => {
            db.query(insert_funding_query, fundingData, (err, result) =>{
                if (err) reject(err);
                else resolve(result[0]);
            })
        })
    },

    fundingImg: (img) => {
        return new Promise ((resolve, reject) => {
            db.query(insert_fundingImg_query, img, (err, result) =>{
                if (err) reject(err);
                else resolve(result[0]);
            })
        })
    },

    createItem: (itemData) => {
        return new Promise ((resolve, reject) => {
            db.query(insert_item_query, itemData, (err, result) =>{
                if (err) reject(err);
                else resolve(result[0]);
            })
        })
    },

    itemImg: (img) => {
        return new Promise ((resolve, reject) => {
            db.query(insert_itemImg_query, img, (err, result) =>{
                if (err) reject(err);
                else resolve(result[0]);
            })
        })
    },

    searchFunding: () => {
        return new Promise ((resolve, reject) => {
            db.query(search_funding_query, (err, result) =>{
                if (err) reject(err);
                else resolve(result[0]);
            })
        })
    },

    imagesByFundingId: (fundingId) => {
        return new Promise ((resolve, reject) => {
            db.query(imagesByFundingId_query, fundingId, (err, result) =>{
                if (err) reject(err);
                else resolve(result[0]);
            })
        })
    },

    fundingById: (fundingId) => {
        return new Promise ((resolve, reject) => {
            db.query(search_fundingId_query, fundingId, (err, result) =>{
                if (err) reject(err);
                else resolve(result[0]);
            })
        })
    },

    fundingByUser: (userName) => {
        return new Promise ((resolve, reject) => {
            db.query(userNameByFunding_query, userName, (err, result) =>{
                if (err) reject(err);
                else resolve(result[0]);
            })
        })
    },

    createFundingList: (fundingId, itemId, PARTNER_ORDER_ID, userName, quantity) => {
        return new Promise ((resolve, reject) => {
            db.query(create_fundingList_query, [fundingId, itemId, PARTNER_ORDER_ID, userName, quantity], (err, result) =>{
                if (err) reject(err);
                else resolve(result[0]);
            })
        })
    },

    searchItem: (fundingId) => {
        return new Promise ((resolve, reject) => {
            db.query(search_fundingItem_query, fundingId, (err, result) =>{
                if(err) reject(err);
                else resolve(result);
            })
        })
    },
}

module.exports = fundingModel;