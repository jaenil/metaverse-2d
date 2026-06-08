import express from 'express';
import {router} from './routes/v1/index.js';

const app = express();

app.get('/', (req, res) => {
    res.send('Backend is running currently at time : ' + new Date().toLocaleString()) ;
});

app.use('/api/v1', router);

app.listen(process.env.PORT ||3000) 