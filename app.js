const express = require('express');
const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
    res.send("Start POPHUB!");
});

app.listen(PORT, () =>{
    console.log(`${PORT}번 실행 중`)
})