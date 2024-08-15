const cron = require('node-cron');
const db = require('../config/mysqlDatabase');
const open_query =
    'UPDATE popup_stores SET store_status = "오픈" WHERE store_status = "오픈 예정" AND store_start_date <= DATE(NOW() + INTERVAL 9 HOUR)';
const close_query =
    'UPDATE popup_stores SET store_status = "마감" WHERE store_status = "오픈" AND store_end_date < DATE(NOW() + INTERVAL 9 HOUR)';
const completed_query =
    'UPDATE reservation SET reservation_status = "completed" WHERE reservation_date < DATE(NOW() + INTERVAL 9 HOUR)';

const delete_wait_list_query = 'DROP TABLE IF EXISTS wait_list';
const create_wait_list_query = `
CREATE TABLE wait_list(
    user_name varchar(50) NOT NULL,
    store_id varchar(50) NOT NULL,
    status ENUM('waiting', 'completed', 'cancelled') NOT NULL default 'waiting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_name) REFERENCES user_info(user_name) ON UPDATE CASCADE,
    FOREIGN KEY (store_id) REFERENCES popup_stores(store_id) ON UPDATE CASCADE,
    
    primary key(user_name, store_id)
  )
`;

const join_date_count_query = `SELECT uj.user_id, ui.user_name 
    FROM user_join_info uj 
    INNER JOIN user_info ui ON uj.user_id = ui.user_id
    WHERE DATEDIFF(NOW(), uj.join_date) >= 10
      AND NOT EXISTS (
          SELECT 1 FROM achieve_hub ah 
          WHERE ah.user_name = ui.user_name 
          AND ah.achieve_id = 9
      );`;

const updateStatus = (query) =>
    new Promise((resolve, reject) => {
        db.query(query, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });

async function updatePopupStatus() {
    try {
        await updateStatus(open_query);
        await updateStatus(close_query);
    } catch (err) {
        res.status(500).send("오류가 발생하였습니다.");
    }
}

async function updateReservationStatus() {
    try {
        await updateStatus(completed_query);
    } catch (err) {
        res.status(500).send("오류가 발생하였습니다.");
    }
}

const resetWaitList = async () => {
    try {
        await updateStatus(delete_wait_list_query);
        await updateStatus(create_wait_list_query);
    } catch (err) {
        res.status(500).send("오류가 발생하였습니다.");
    }
};

const joinDate = async () => {
    new Promise((resolve, reject) => {
        db.query(join_date_count_query, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        })
    })
};

function scheduleDatabaseUpdate() {
    cron.schedule('0 0 * * *', async () => {
        await updatePopupStatus();
        await updateReservationStatus();
        await resetWaitList();
        await joinDate();
    });
}

module.exports = { scheduleDatabaseUpdate };
