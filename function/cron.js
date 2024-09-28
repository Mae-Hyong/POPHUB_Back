const cron = require('node-cron');
const db = require('../config/mysqlDatabase');
const axios = require('axios');
require('dotenv').config();
const open_query =
    'UPDATE popup_stores SET store_status = "오픈" WHERE store_status = "오픈 예정" AND store_start_date <= DATE(NOW() + INTERVAL 9 HOUR)';
const close_query =
    'UPDATE popup_stores SET store_status = "마감" WHERE store_status = "오픈" AND store_end_date < DATE(NOW() + INTERVAL 9 HOUR)';
const completed_query =
    'UPDATE reservation SET reservation_status = "completed" WHERE reservation_date < DATE(NOW() + INTERVAL 9 HOUR)';

const delete_wait_list_query = 'DELETE FROM wait_list WHERE status = "pending"';
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

const checkDelivery_query = 'SELECT tracking_number, courier FROM delivery WHERE status = "주문 완료" OR status = "배송 중"';
const deliveryStatus_query = 'UPDATE delivery SET status = ? WHERE courier = ? AND tracking_number = ?';

const open_funding_query = `
    UPDATE funding 
    SET status = 'open' 
    WHERE open_date = NOW()
`;

const fail_funding_query = `
    UPDATE funding 
    SET status = 'fail' 
    WHERE close_date < NOW() 
    AND donation < amount;
`;

const successful_funding_query = `
    UPDATE funding 
    SET status = 'successful' 
    WHERE close_date < NOW() 
    AND donation >= amount;
`;

const progress_event_query = `
    UPDATE event 
    SET status = 'wait' 
    WHERE start_date = NOW();
`;

const close_event_query = `
    UPDATE event 
    SET status = 'end' 
    WHERE end_date < NOW();
`;

const updateStatus = (query) =>
    new Promise((resolve, reject) => {
        db.query(query, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });

const updateParamsStatus = (query, params) =>
    new Promise((resolve, reject) => {
        db.query(query, params, (err, result) => {
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
};

async function updateReservationStatus() {
    try {
        await updateStatus(completed_query);
    } catch (err) {
        res.status(500).send("오류가 발생하였습니다.");
    }
};

async function getDeliveryStatus(courier, trackingNumber) {
    try {
        const courierMap = {
            'cjlogistics': 'kr.cjlogistics',
            'logen': 'kr.logen',
            'epost': 'kr.epost',
            'hanjin': 'kr.hanjin',
            'lotte': 'kr.lotte'
        };
        const carrierId = courierMap[courier];
        const headers = {
            'Authorization': `TRACKQL-API-KEY ${process.env.DELIVERY_CLIENT_ID}:${process.env.DELIVERY_CLIENT_SECRET}`,
            'Content-Type': 'application/json'
        };

        const url = `https://apis.tracker.delivery/carriers/${carrierId}/tracks/${trackingNumber}`;
        const response = await axios.get(url, { headers });

        return response.data.state.text;
    } catch (err) {
        console.log("배송 상태 조회 중 오류가 발생하였습니다.");
    }
}

async function updateDeliveryStatus() {
    try {
        const rows = await updateStatus(checkDelivery_query);
        if (rows && rows.length > 0) {
            for (const row of rows) {
                const { tracking_number, courier } = row;
                const status = await getDeliveryStatus(courier, tracking_number);
                const newStatus = status && status.includes("완료") ? "배송 완료" : "배송 중";
                await updateParamsStatus(deliveryStatus_query, [newStatus, courier, tracking_number]);

            }
            console.log("배송 상태 업데이트 완료");
        } else {
            console.log("배송 업데이트할 값이 없습니다.");
        }
    } catch (err) {
        console.log("배송 상태 업데이트 중 오류가 발생하였습니다.");
    }
}
const updateWaitList = async () => {
    try {
        await updateStatus(delete_wait_list_query);
        //await updateStatus(create_wait_list_query);
    } catch (err) {
        res.status(500).send("오류가 발생하였습니다.");
    }
};

async function openFundingGoals() {
    new Promise((resolve, reject) => {
        db.query(open_funding_query, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

async function failFundingGoals() {
    new Promise((resolve, reject) => {
        db.query(fail_funding_query, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

async function successFundingGoals() {
    new Promise((resolve, reject) => {
        db.query(successful_funding_query, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

async function progressEventCheck() {
    new Promise((resolve, reject) => {
        db.query(progress_event_query, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

async function endEventCheck() {
    new Promise((resolve, reject) => {
        db.query(close_event_query, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

function scheduleDatabaseUpdate() {
    cron.schedule('0 0 * * *', async () => {
        await updatePopupStatus();
        await updateDeliveryStatus();
        //await updateReservationStatus();
        await updateWaitList();
        await openFundingGoals();
        await failFundingGoals();
        await successFundingGoals();
        await progressEventCheck();
        await endEventCheck();
    });
};

module.exports = { scheduleDatabaseUpdate };