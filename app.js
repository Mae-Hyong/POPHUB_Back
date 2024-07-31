const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const cron = require("./function/cron");
const admin = require("firebase-admin");
const serviceAccount = require("./config/PopHub_Key.json");
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Swagger 설정
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'A simple Express API'
    },
    servers: [
      {
        url: 'http://localhost:3000'
      }
    ]
  },
  apis: ['./router/*.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
const adminRouter = require("./router/adminRouter");
const userRouter = require("./router/userRouter");
const payRouter = require("./router/payRouter");
const popupRouter = require("./router/popup");
const productRouter = require("./router/product");
const alarmRouter = require("./router/alarmRouter");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// body-parser 미들웨어 등록
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Start POPHUB!");
});

// 인증 라우터
app.use("/admin", adminRouter);
app.use("/user", userRouter);
app.use("/pay", payRouter);
app.use("/popup", popupRouter);
app.use("/product", productRouter);
app.use("/alarm", alarmRouter);

cron.scheduleDatabaseUpdate();

app.listen(process.env.PORT, () => {
  console.log(`${process.env.PORT}번 실행 중`);
});
