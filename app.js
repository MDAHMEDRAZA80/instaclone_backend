const express = require('express')
const cors = require("cors")
const app = express()
app.use(cors())
//schema
require('./models/user')
require('./models/post')

app.use(express.json())

//router
app.use(require('./routes/auth'))
app.use(require('./routes/post'))
const mongoose = require('mongoose')
const dotenv = require('dotenv')
require('dotenv').config()
const PORT = process.env.PORT || 4000
const requireLogin = require('./middleware/requireLogin');



//CONNECTING TO MONGODB
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI)
mongoose.connection.on('connected', () => {
    console.log('connected to mongoDb');
})
mongoose.connection.on('eroor', (err) => {
    console.log('error connecting ', err);
})

//listening to SERVER
app.listen(PORT, () => {
    console.log('server is running on', PORT);
})

