import express from 'express';
import { router } from './routes/v1/index.js';
import prisma from '@repo/db';
const app = express();
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Backend is running currently at time : ' + new Date().toLocaleString());
});

app.use('/api/v1', router);

app.listen(process.env.PORT || 3000) 