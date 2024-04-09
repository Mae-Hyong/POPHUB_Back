const express = require('express');
const app = express();
const PORT = 3000;
const bodyParser = require('body-parser');
const cors = require("cors");

// Routes
const userRoute = require('./router/userRouter');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
}));

app.get("/", (req, res) => {
    res.send("Start POPHUB!");
});

app.use("/user", userRoute);

app.listen(PORT, () =>{
    console.log(`${PORT}번 실행 중`)
})