import express from 'express';
import bodyParser from 'body-parser';
const app = express(); // express nodejs application has an inbuilt router
const port = 3000;
import router from './routes/index.js';
import './config/mongoose.js';
import './config/nodemailer.js';
import cookieParser from 'cookie-parser';

app.use(bodyParser.json());
app.use(cookieParser());

app.use('/', router); // / means all the APIs

app.listen(port, (err) => {
    if (err) {
        console.log(err);
    }
  console.log(`Server is running at http://localhost:${port}`);
});