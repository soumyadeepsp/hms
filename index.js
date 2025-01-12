import express from 'express';
import bodyParser from 'body-parser';
const app = express(); // express nodejs application has an inbuilt router
const port = 3000;
import { signup } from './controllers/userController.js';
import './config/mongoose.js';

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('hello');
});

app.get('/api/new-endpoint', (req, res) => {
    return res.json({ message: 'This is a new API endpoint' });
});

app.post('/user/signup', signup);

app.listen(port, (err) => {
    if (err) {
        console.log(err);
    }
  console.log(`Server is running at http://localhost:${port}`);
});