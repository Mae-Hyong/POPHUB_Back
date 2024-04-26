const express = require('express');
const app = express();
const PORT = 3000;
const bodyParser = require('body-parser');
const cors = require("cors");

// Routes
const userRoute = require('./router/userRouter');
const popupRouter = require('./router/popup');
const productRouter = require('./router/product');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
}));

// body-parser 미들웨어 등록
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("Start POPHUB!");
});

// 인증 라우터
app.use("/user", userRoute);
app.use('/popup', popupRouter); // popup 라우터 사용
app.use('/product', productRouter);

app.listen(PORT, () =>{
    console.log(`${PORT}번 실행 중`)
})