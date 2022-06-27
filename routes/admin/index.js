const Router = require("express").Router()

Router
    .get('/', (req, res) => {
        res.json({ msg: 'Admin Routes' })
    })

module.exports = Router