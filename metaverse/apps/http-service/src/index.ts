import './dotenv-setup.js';
import express from 'express';
// 1. Import cors
import cors from 'cors';
import { router } from './routes/v1/index.js';

const app = express();

// 2. Use the cors middleware BEFORE your routes!
app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Backend is running currently at time : ' + new Date().toLocaleString());
});

app.use('/api/v1', router);

app.listen(process.env.PORT || 3000);
