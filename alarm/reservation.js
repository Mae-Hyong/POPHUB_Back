const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const cron = require("node-cron");
app.use(bodyParser.json());

// 예약 대기 알림 설정 추가
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

// 예약 상태 체크 및 알림 전송
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
      // 대기 리스트에서 알림 보내지 않은 사용자 찾기
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
                  console.log("Successfully sent message:", response);
                })
                .catch((error) => {
                  console.error("Error sending message:", error);
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
