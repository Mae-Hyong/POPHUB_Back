const db = require('../config/mysqlDatabase');
const kmeans = require('node-kmeans');

const getUserInfo_query = 'SELECT gender, age FROM user_info WHERE user_name = ?';
const getPaymentDetails_query = 'SELECT user_name, store_id FROM payment_details';
const getCategoryId_query = 'SELECT category_id FROM popup_stores WHERE store_id = ?';
const getPopup_query = 'SELECT * FROM popup_stores WHERE category_id = ?'
async function getRecommendation(user_name) {
    try {
        console.log("ㅎㅇ");
        const userInfo = await new Promise((resolve, reject) => {
            db.query(getUserInfo_query, [user_name], (err, results) => {
                if (err) return reject(err);
                console.log(results[0]);
                resolve(results[0]);
            });
        });

        const paymentDetails = await new Promise((resolve, reject) => {
            db.query(getPaymentDetails_query, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        const categoryDetails = await Promise.all(paymentDetails.map(detail =>
            new Promise((resolve, reject) => {
                db.query(getCategoryId_query, [detail.store_id], (err, results) => {
                    if (err) return reject(err);
                    resolve({
                        user_name: detail.user_name,
                        store_id: detail.store_id,
                        category_id: results[0].category_id
                    });
                });
            })
        ));

        // 데이터 전처리
        const data = categoryDetails.map(detail => {
            return {
                user_name: detail.user_name,
                gender: userInfo.gender,
                age: userInfo.age,
                category_id: detail.category_id
            };
        });

        // K-means 클러스터링 적용
        const vectors = data.map(item => [item.gender === 'male' ? 0 : 1, item.age]);
        const kmeansResult = await new Promise((resolve, reject) => {
            kmeans.clusterize(vectors, { k: 3 }, (err, res) => {
                if (err) return reject(err);
                resolve(res);
            });
        });

        // 현재 사용자의 클러스터 찾기
        const userVector = [userInfo.gender === 'male' ? 0 : 1, userInfo.age];
        const userCluster = kmeansResult.find(cluster =>
            cluster.clusterInd.includes(vectors.findIndex(vector =>
                vector[0] === userVector[0] && vector[1] === userVector[1]
            ))
        );

        // 자주 사용하는 category_id 찾기
        const recommendedCategory = userCluster.cluster
            .map(index => data[index])
            .reduce((acc, curr) => {
                acc[curr.category_id] = (acc[curr.category_id] || 0) + 1;
                return acc;
            }, {});

        const topCategoryId = Object.keys(recommendedCategory).reduce((a, b) =>
            recommendedCategory[a] > recommendedCategory[b] ? a : b
        );

        // 추천된 category_id에 해당하는 popup_stores 가져오기
        const recommendedStores = await new Promise((resolve, reject) => {
            db.query(getPopup_query, [topCategoryId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        return recommendedStores;
    } catch (err) {
        throw err;
    }
}

module.exports = { getRecommendation };
