const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const sendMessage = require('./message');

app.use(bodyParser.json()); // JSON 형식의 요청 본문(body)을 해석합니다.
app.use(bodyParser.urlencoded({ extended: true })); // URL-encoded 형식의 요청 본문(body)을 해석합니다.

app.get("/", (req, res) => {
    res.send("Start POPHUB!");
});

app.post("/SMS", (req, res) => {
    const phoneNumber = req.body.phoneNumber;

    sendMessage(phoneNumber);
    res.send("Test");
})

app.listen(PORT, () =>{
    console.log(`${PORT}번 실행 중`)
})