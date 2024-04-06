const express = require('express');

const popupRouter = require('./router/popup');

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Start POPHUB!");
});

// 인증 라우터
app.use('/popup', popupRouter); // popup 라우터 사용

app.listen(PORT, () =>{
    console.log(`${PORT}번 실행 중`)
})