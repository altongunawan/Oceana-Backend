require('dotenv').config({path: __dirname + '/.env' })
const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const cors = require('cors')

const app = express()
const port = process.env.PORT || 4000

const userRoutes = require('./routes/user')
const adminRoutes = require('./routes/admin')

app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/api/user', userRoutes)
app.use('/api/admin', adminRoutes)

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(port, () => {
            console.log(`Listening on port: ${port}`)
        })
    })
    .catch((err) => {
        console.log(err)
    })

