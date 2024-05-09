const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require("cors");

// Routes
const adminRouter = require('./router/adminRouter');
const userRouter = require('./router/userRouter');
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
app.use("/admin", adminRouter);
app.use("/user", userRouter);
app.use('/popup', popupRouter); // popup 라우터 사용
app.use('/product', productRouter);

app.listen(process.env.PORT, () =>{
    console.log(`${process.env.PORT}번 실행 중`)
})