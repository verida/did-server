import express from 'express'
const cors = require('cors')
import bodyParser from 'body-parser'
import router from './routes'
import DbManager from './dbManager'

import dotenv from 'dotenv'
dotenv.config();

// Set up the express app
const app = express();

const corsConfig = {}

// Parse incoming requests data
app.use(cors(corsConfig))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(router)

DbManager.ensureDb(process.env.DB_DOC_NAME)

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});