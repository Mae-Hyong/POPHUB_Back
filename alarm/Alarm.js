const admin = require("firebase-admin");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cron = require("node-cron");

// Firebase Admin SDK 초기화
var serviceAccount = require("./PopHub_Key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

app.use(bodyParser.json());

// 사용자 및 FCM 토큰 초기화
app.post("/add-user", async (req, res) => {
  const { userId, fcmToken } = req.body;
  try {
    await db
      .collection("users")
      .doc(userId)
      .set({ fcmToken: fcmToken }, { merge: true });
    res.status(200).send(`사용자 ${userId} 및 FCM 토큰 저장 성공`);
  } catch (error) {
    console.error("사용자 추가 오류:", error);
    res.status(500).send("사용자 추가 오류");
  }
});

// 알람 추가
app.post("/add-alarm", async (req, res) => {
  const { userId, type, alarmDetails } = req.body; // type: 'alarms', 'orderAlarms', or 'waitAlarms'
  try {
    const alarmRef = await db
      .collection("users")
      .doc(userId)
      .collection(type)
      .add(alarmDetails);
    res.status(200).send(`알람이 성공적으로 추가되었습니다: ${alarmRef.id}`);
  } catch (error) {
    console.error("알람 추가 오류:", error);
    res.status(500).send("알람 추가 오류");
  }
});

// FCM 토큰 저장 및 만료일 설정
app.post("/save-token", async (req, res) => {
  const { userId, fcmToken } = req.body;
  const expiresIn = 14; // 토큰 유효 기간 (14일)
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + expiresIn); // 현재 날짜에 + 14일

  try {
    await db.collection("users").doc(userId).set(
      {
        fcmToken: fcmToken,
        expirationDate: expirationDate,
      },
      { merge: true }
    );
    res.status(200).send("토큰이 성공적으로 저장됨");
  } catch (error) {
    console.error("토큰 저장 오류:", error);
    res.status(500).send("토큰 저장 오류");
  }
});

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
  console.log("만료된 토큰 처리 완료");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
