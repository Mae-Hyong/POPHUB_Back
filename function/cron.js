const cron = require('node-cron');
const connection = require('../config/mysqlDatabase');
const open_query = `UPDATE popup_stores SET store_status = '오픈' WHERE store_status = '오픈 예정' AND store_start_date <= DATE(NOW() + INTERVAL 9 HOUR)`;
const close_query = `UPDATE popup_stores SET store_status = '마감' WHERE store_status = '오픈' AND store_end_date <= DATE(NOW() + INTERVAL 9 HOUR);`;

const updateStatus = (query) => new Promise((resolve, reject) => {
    connection.query(query, (err, result) => {
        if (err) reject(err);
        else resolve(result);
    });
});

async function updateDatabase() {
    try {
        const openResult = await updateStatus(open_query);
        console.log('Open stores updated:', openResult);

        const closeResult = await updateStatus(close_query);
        console.log('Closed stores updated:', closeResult);
    } catch (err) {
        throw err;
    }
}

function scheduleDatabaseUpdate() {
    cron.schedule('0 0 * * *', async () => {
        console.log('Update popup_status');
        await updateDatabase();
    });
}

module.exports = { scheduleDatabaseUpdate };
