const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const cron = require("node-cron");

// Firebase Admin SDK 초기화
var serviceAccount = require("./PopHub_Key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

app.use(bodyParser.json());

// 사용자 및 FCM 토큰 초기화
app.post("/token_reset", async (req, res) => {
  const { userName, fcmToken } = req.body;
  try {
    await db
      .collection("users")
      .doc(userName)
      .set({ fcmToken: fcmToken }, { merge: true });
    res.status(200).send(`사용자 ${userName} 및 FCM 토큰 저장 성공`);
  } catch (error) {
    console.error("사용자 추가 오류:", error);
    res.status(500).send("사용자 추가 오류");
  }
});

// 알람 추가
app.post("/alarm_add", async (req, res) => {
  const { userName, type, alarmDetails } = req.body; // type: 'alarms', 'orderAlarms', 'waitAlarms'

  // 'alarmDetails' 내의 필수 필드 확인
  if (
    !userName ||
    !type ||
    !alarmDetails ||
    !alarmDetails.time ||
    !alarmDetails.title ||
    !alarmDetails.label ||
    alarmDetails.active === undefined
  ) {
    return res.status(400).send("필수 필드가 누락되었습니다.");
  }

  try {
    const userRef = db.collection("users").doc(userName).collection(type);

    // 중복 알람 확인, 'time'과 'label' 기준
    const existingAlarms = await userRef
      .where("time", "==", alarmDetails.time)
      .where("label", "==", alarmDetails.label)
      .get();

    if (!existingAlarms.empty) {
      return res.status(200).send("동일한 알람이 이미 존재합니다.");
    }

    // 새로운 알람 추가
    const alarmRef = await userRef.add({
      time: alarmDetails.time,
      label: alarmDetails.label,
      title: alarmDetails.title,
      active: alarmDetails.active,
    });
    res.status(200).send(`알람이 성공적으로 추가되었습니다: ${alarmRef.id}`);
  } catch (error) {
    console.error("알람 추가 오류:", error);
    res.status(500).send("알람 추가 오류");
  }
});

// FCM 토큰 저장 및 만료일 설정
app.post("/token_save", async (req, res) => {
  const { userName, fcmToken } = req.body;
  const expiresIn = 14; // 토큰 유효 기간 (14일)
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + expiresIn); // 현재 날짜에 + 14일

  try {
    await db.collection("users").doc(userName).set(
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

// 사용자 대기 목록에 추가
app.post("/waitlist_add", async (req, res) => {
  const { userName, storeId, date, desiredTime } = req.body;

  if (!userName || !storeId || !date || !desiredTime) {
    return res.status(400).send("필수 필드가 누락되었습니다.");
  }

  try {
    const waitlistRef = db.collection("waitlist");
    const waitlistDoc = await waitlistRef.add({
      userName,
      storeId,
      date,
      desiredTime,
      notified: false,
    });
    res
      .status(200)
      .send(`대기 알림이 성공적으로 추가되었습니다: ${waitlistDoc.id}`);
  } catch (error) {
    console.error("대기 알림 추가 오류:", error);
    res.status(500).send("대기 알림 추가 오류");
  }
});

// 예약 상태 확인 및 대기 사용자에게 알림 전송
app.post("/check_and_notify", async (req, res) => {
  const { storeId } = req.body;

  if (!storeId) {
    return res.status(400).send("스토어 ID가 누락되었습니다.");
  }

  try {
    // 예약 가능 자리 확인
    const reservationUrl = `https://pophub-fa05bf3eabc0.herokuapp.com/popup/reservation/${storeId}`;
    const response = await fetch(reservationUrl);
    const data = await response.json();
    const availableCount = data.count;

    if (availableCount > 0) {
      // 알림 보내지 않은 대기 목록 사용자 찾기
      const waitlistSnapshot = await db
        .collection("waitlist")
        .where("storeId", "==", storeId)
        .where("notified", "==", false)
        .get();

      const batch = db.batch();

      waitlistSnapshot.forEach((doc) => {
        const waitlistData = doc.data();
        const userRef = db.collection("users").doc(waitlistData.userName);
        userRef.get().then((userDoc) => {
          if (userDoc.exists) {
            const fcmToken = userDoc.data().fcmToken;
            if (fcmToken) {
              // 알림 전송
              const message = {
                notification: {
                  title: "예약 가능 알림",
                  body: `${waitlistData.date} ${waitlistData.desiredTime}에 예약이 가능합니다.`,
                },
                token: fcmToken,
              };

              admin
                .messaging()
                .send(message)
                .then((response) => {
                  console.log("성공적으로 메시지가 보내짐:", response);
                })
                .catch((error) => {
                  console.error("메시지 보내는 중 오류남", error);
                });
            }
          }
        });

        // notified 상태 true로 변경
        batch.update(doc.ref, { notified: true });
      });

      await batch.commit();
      res.status(200).send("알림이 성공적으로 전송되었습니다.");
    } else {
      res.status(200).send("예약 가능한 자리가 없습니다.");
    }
  } catch (error) {
    console.error("알림 전송 오류:", error);
    res.status(500).send("알림 전송 오류");
  }
});
