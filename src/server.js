import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import router from './routes/index.js';
require('dotenv').config();

const basicAuth = require('express-basic-auth');

// Set up the express app
const app = express();

let corsConfig = {
  origin: process.env.CORS_HOST
};

// Parse incoming requests data
app.use(cors(corsConfig));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(router);

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});