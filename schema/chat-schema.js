const mongoose = require('mongoose')
var AutoIncrement = require('mongoose-sequence')(mongoose);
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')

const ChatSchema = new mongoose.Schema({
    chat_id: {
        type: Number
    },
    participant: Array,
    conversation: [{
        email_address : String,
        content: String,
        created_at: {
            type: Date,
            default: Date.now
        }
    }],
}, { timestamps: true })

ChatSchema.plugin(AutoIncrement, {id:'order_seq_chat',inc_field: 'post_id'});
module.exports = mongoose.model('Chat', ChatSchema)