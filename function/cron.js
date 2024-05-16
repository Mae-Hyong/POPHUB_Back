const cron = require('node-cron');
const connection = require('../config/mysqlDatabase');
const open_query = `UPDATE popup_stores SET store_status = '오픈' WHERE store_status = '오픈 예정' AND store_start_date <= DATE(NOW() + INTERVAL 9 HOUR)`;
const close_query = `UPDATE popup_stores SET store_status = '마감' WHERE store_status = '오픈' AND store_end_date <= DATE(NOW() + INTERVAL 9 HOUR);`;

const queryPromise = (query) => new Promise((resolve, reject) => {
  connection.query(query, (error, result) => {
    if (error) reject(error);
    resolve(result);
  });
});

async function updateDatabase() {  
  try {
    const openResult = await queryPromise(open_query);
    console.log('Open stores updated:', openResult);

    const closeResult = await queryPromise(close_query);
    console.log('Closed stores updated:', closeResult);
  } catch (error) {
    console.error('Error executing query:', error);
  }
}

function scheduleDatabaseUpdate() {
  cron.schedule('0 0 * * *', async () => {
    console.log('Running database update task...');
    await updateDatabase();
  });
}

module.exports = { scheduleDatabaseUpdate };
