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

// 문서 조회 API
app.get("/fetch-documents", async (req, res) => {
  try {
    const documents = await fetchDocuments(); // 문서 조회 함수 실행 및 문서 데이터 반환
    res.status(200).json(documents); // 문서 데이터를 JSON 형태로 클라이언트에 응답
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).send("Error fetching documents");
  }
});

// FCM 토큰 업데이트 API (MySQL DB 연동해야 할 듯)
app.post("/update-token", async (req, res) => {
  const { userId, newToken } = req.body;

  try {
    await db.collection("users").doc(userId).update({
      fcmToken: newToken,
    });
    res.status(200).send("Token updated successfully");
  } catch (error) {
    console.error("Error updating token:", error);
    res.status(500).send("Error updating token");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

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
        console.log(`[${path.collection}] The document does not exist!`);
        documents.push({
          collection: path.collection,
          documentId: path.document,
          data: null,
        });
      }
    }
    return documents;
  } catch (error) {
    console.error("Error getting documents:", error);
    throw error; // 에러 발생 시 에러를 상위 호출자에게 전파
  }
}

// node-cron을 사용하여 주기적인 작업 설정
cron.schedule("0 0 * * *", async () => {
  console.log("Midnight task running...");
  fetchDocuments(); // 문서 조회 함수 실행
});
