const express = require('express')
const db = require('./config/db.js')
require('dotenv').config()

const app = express()

app.listen(4010, () => {
    console.log('Server berada di 4010')
})