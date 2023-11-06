const express = require('express');
require('./utils/mongoose-connector.js');
require('./utils/mongoose-bootstrapper.js');
require('./config/index.js');
const userRouter = require('./routes/user.route.js');
const noteRouter = require('./routes/note.route.js');
const cors = require("cors")
const cookieParser = require("cookie-parser");

const { verifyToken } = require('./utils/jwt.js');

const app = express();
app.use(cors());
app.disable("x-powered-by"); //Reduce fingerprinting
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Welcome to Note taking app'); // Set your welcome message here
  });
app.use("/users", userRouter);
app.use(verifyToken);
app.use("/note", noteRouter);

app.listen(process.env.PORT || 8080, (err, connect) => {
    if (err)
        console.log(err)
    else
        console.log(`Port ${process.env.PORT || 8080} connected`)
})
