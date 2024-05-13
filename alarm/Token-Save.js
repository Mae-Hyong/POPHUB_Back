//FCM 토큰 저장
const admin = require("firebase-admin");

// Firebase 초기화
if (admin.apps.length === 0) {
  admin.initializeApp({});
}

const db = admin.firestore();

async function saveUserFcmToken(userId, fcmToken) {
  // 사용자의 FCM 토큰을 사용자 문서에 저장
  const userRef = db.collection("users").doc(userId);
  await userRef.set(
    {
      fcmToken: fcmToken,
    },
    { merge: true }
  ); // 기존 데이터를 유지, fcmToken만 업데이트
}

// 사용 임시 예
saveUserFcmToken("유저 아이디", "FCM토큰")
  .then(() => {
    console.log("FCM 토큰 저장 성공");
  })
  .catch((error) => {
    console.error("FCM 토큰 저장 에러:", error);
  });
