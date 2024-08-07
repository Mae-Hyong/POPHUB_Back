const admin = require("firebase-admin");

const sendAlarm = async (alarmData) => {
    const message = {
        notification: {
            title: alarmData.title,
            body: alarmData.content,
        },
        token: alarmData.fcm_token, // 사용자 FCM 토큰
    };

    try {
        await admin.messaging().send(message);
        console.log(`알림 전송 성공: ${alarmData.user_name}`);
    } catch (error) {
        console.error("알림 전송 실패:", error);
    }
};

module.exports = { sendAlarm };
