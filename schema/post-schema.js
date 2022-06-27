const mongoose = require('mongoose')
var AutoIncrement = require('mongoose-sequence')(mongoose);
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')

const PostSchema = new mongoose.Schema({
    nama: {
        type : String
    },
    post_id: {
        type: Number
    },
    email_address : {
        type : String,
        required: true
    },
    content: {
        type : String
    },
    like: [{
        email_address : String
    }],
    comment : [{
        id: Number,
        nama : String,
        email_address : String,
        content: String
    }],
}, { timestamps: true })

PostSchema.plugin(AutoIncrement, {id:'order_seq',inc_field: 'post_id'});
module.exports = mongoose.model('Post', PostSchema)