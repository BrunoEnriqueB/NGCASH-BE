import express from 'express';
import prismaClient from './config/db';
import apiRoutes from './routes';
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(apiRoutes);

prismaClient.$connect().catch((error) => {
  console.log('Database connection error: ' + error);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
