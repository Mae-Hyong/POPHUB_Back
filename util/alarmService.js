const admin = require("firebase-admin");

const sendAlarm = async (reservation) => {
    const message = {
        notification: {
            title: "예약 알림",
            body: `${reservation.user_name}님의 예약 시간이 되었습니다.`,
        },
        token: reservation.fcm_token, // 사용자 FCM 토큰
    };

    try {
        await admin.messaging().send(message);
        console.log(`알림 전송 성공: ${reservation.user_name}`);
    } catch (error) {
        console.error("알림 전송 실패:", error);
    }
};

module.exports = { sendAlarm };
