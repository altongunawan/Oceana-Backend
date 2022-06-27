const mongoose = require('mongoose')
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'OCEANA'
const JWT_LIFETIME = '1d'

const UserSchema = new mongoose.Schema({
    nama : {
        type : String,
    },
    email_address : {
        type : String,
        unique : true
    },
    password : {
        type: String,
        select: false
    },
    bookmark: Array,
    friends: Array,
    post: Array
}, { timestamps: true })

UserSchema.pre("save", function save(next){
    const user = this;
    if(!user.isModified('password')) return next()

    bcrypt.genSalt(10, (err,salt)=>{
        if(err) return next(err)

        bcrypt.hash(user.password, salt,  (error, hash)=>{
            if(error) return next(error)
            user.password = hash
            return next()
        });
    });
});

const comparePassword = function (inputPassword ) {
    const user = this
    return new Promise(function(resolve, reject) {
        bcrypt.compare(inputPassword, user.password, function(err, res) {
            if (err) {
                throw new Error(err.message)
            } else {
                resolve(res);
            }
        });
    });
}

const createJWT = () => {
    const user = this;
    return new Promise(function(resolve, reject) {
        jwt.sign({ email_address: user.email_address, nama: user.nama}, JWT_SECRET, {
            expiresIn: JWT_LIFETIME,
        }, (err, encoded) =>{
            if (err) {
                throw new Error(err.message)
            } else {
                 resolve(encoded);
            }
        })
    });
}

UserSchema.methods.comparePassword = comparePassword;
UserSchema.methods.createJWT = createJWT;

module.exports = mongoose.model('User', UserSchema)