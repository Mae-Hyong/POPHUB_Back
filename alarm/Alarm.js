const admin = require("firebase-admin");
const express = require("express");
const bodyParser = require("body-parser");
const cron = require("node-cron");

// Firebase Admin SDK 초기화
var serviceAccount = require("./PopHub_Key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Firestore 인스턴스 가져오기
const db = admin.firestore();

// Express 서버 설정
const app = express();
const port = 3000;
app.use(bodyParser.json());

// 루트 경로에 대한 GET 요청 처리
app.get("/", (req, res) => {
  res.send("Alarm server on");
});

// user_id 추가, alarm, order alarm, wait alarm 자동으로 생성
async function addUserAndInitializeAlarms(userId) {
  try {
    await db.collection("users").doc(userId).set({
      alarms: [],
      orderAlarms: [],
      waitAlarms: [],
      fcmToken:
        "fjv14SOYS7aKtFd7m6vH8k:APA91bFbhHpwXFC4g1CjGRIQ_c8HX0G5Ez26-Sq4cjr0gi17UWMXk8eFr6qDNXu492fg_67E3nx68Ls8Tmw6urEh5WG0JoB7F8C-xoPYpeZWAF3lcZURp88gDsssfL27WCsZK_29cLZU",
    });
    console.log(`사용자 ${userId} 초기 알람이 성공적으로 추가되었습니다.`);
  } catch (error) {
    console.error(
      "사용자 추가 및 Firestore에 알람 초기화 중 오류 발생:",
      error
    );
  }
}

// FCM 토큰 업데이트 API
app.post("/update-token", async (req, res) => {
  const { userId, newToken } = req.body;

  try {
    await db.collection("users").doc(userId).update({
      fcmToken: newToken,
    });
    res.status(200).send("토큰이 업데이트됨");
  } catch (error) {
    console.error("토큰 업데이트 오류:", error);
    res.status(500).send("토큰 업데이트 오류");
  }
});

// 문서 조회 API
app.get("/fetch-documents", async (req, res) => {
  try {
    const documents = await fetchDocuments();
    res.status(200).json(documents);
  } catch (error) {
    console.error("문서 가져오는 도중 오류 발생:", error);
    res.status(500).send("문서 가져오는 도중 오류 발생");
  }
});

// 문서 조회 함수
async function fetchDocuments() {
  const documentPaths = [
    { collection: "alarm", document: "GRcvz7Q2pFweB49KrsZA" },
    { collection: "order alarm", document: "wTgsTHLCgUjv8l1NH1pO" },
    { collection: "wait alarm", document: "Zz40RwHnpvwAw6FrlZhy" },
  ];

  let documents = [];

  try {
    for (const path of documentPaths) {
      const docRef = db.collection(path.collection).doc(path.document);
      const doc = await docRef.get();

      if (doc.exists) {
        console.log(`[${path.collection}] Document data:`, doc.data());
        documents.push({
          collection: path.collection,
          documentId: path.document,
          data: doc.data(),
        });
      } else {
        console.log(`[${path.collection}] Document가 존재하지 않습니다`);
        documents.push({
          collection: path.collection,
          documentId: path.document,
          data: null,
        });
      }
    }
    return documents;
  } catch (error) {
    console.error("문서를 가져오는 도중 오류 발생:", error);
    throw error;
  }
}

// node-cron을 사용하여 주기적인 작업 설정
cron.schedule("0 0 * * *", async () => {
  console.log("자정 작업 실행 중...");
  await fetchDocuments();
});

app.listen(port, () => {
  console.log(`${port}번으로 실행 중`);
});
