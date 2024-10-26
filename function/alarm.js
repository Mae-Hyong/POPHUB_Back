const express = require("express");
const bodyParser = require("body-parser");
const cron = require("node-cron");
const admin = require("firebase-admin");

const app = express();
const routes = require("./routes");

// Firebase Admin SDK 초기화
var serviceAccount = process.env.AlARM_JSON;
var fcmKey = Buffer.from(serviceAccount, "base64").toString();
admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(fcmKey)),
});

const db = admin.firestore();

app.use(bodyParser.json());
app.use("/", routes);

// 매일 자정에 만료된 FCM 토큰을 자동 삭제
cron.schedule("0 0 * * *", async () => {
    const now = new Date();
    const expiredTokens = await db
        .collection("users")
        .where("expirationDate", "<=", now)
        .get();
    const batch = db.batch();

    expiredTokens.forEach((doc) => {
        batch.delete(doc.ref); // 만료된 토큰 삭제
    });

    await batch.commit();
});

// 매 분마다 예약 시간이 된 항목에 알림 전송
cron.schedule("*/1 * * * *", async () => {
    const now = new Date();
    const dueReservations = await db
        .collection("reservations")
        .where("reservationTime", "<=", now)
        .where("status", "==", "pending")
        .get();
    dueReservations.forEach(async (doc) => {
        const reservation = doc.data();
        await sendAlarm(reservation); // 알림 전송
        doc.ref.update({ status: "notified" }); // 알림 전송 후 상태 업데이트
    });
});

// 알림을 보내는 함수
const sendAlarm = async (reservation) => {
    const message = {
        notification: {
            title: "예약 알림",
            body: `${reservation.userName}님의 예약 시간이 되었습니다.`,
        },
        token: reservation.fcmToken, // 사용자 FCM 토큰
    };

    try {
        await admin.messaging().send(message);
        console.log(`알림 전송 성공: ${reservation.userName}`);
    } catch (error) {
        console.error("알림 전송 실패:", error);
    }
};
