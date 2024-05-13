app.post("/save-token", async (req, res) => {
  const { userId, fcmToken } = req.body;
  const expiresIn = 14; // 토큰 유효 기간 (14일)
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + expiresIn); // 현재 날짜에 + 14일

  try {
    await db.collection("users").doc(userId).set({
      fcmToken: fcmToken,
      expirationDate: expirationDate,
    });
    res.status(200).send("Token saved successfully");
  } catch (error) {
    console.error("Error saving token:", error);
    res.status(500).send("Error saving token");
  }
});

const cron = require("node-cron");

// 매일 자정에 실행
cron.schedule("0 0 * * *", async () => {
  const now = new Date();
  const expiredTokens = await db
    .collection("users")
    .where("expirationDate", "<=", now)
    .get();
  const batch = db.batch();

  expiredTokens.forEach((doc) => {
    // 만료된 토큰 삭제 혹은 표시
    // ex) batch.delete(doc.ref); 혹은 batch.update(doc.ref, { isActive: false });
  });

  await batch.commit();
  console.log("만료된 토큰 처리 완료");
});
