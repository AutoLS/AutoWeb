const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
}, {timestamps: true});

//static login method
userSchema.statics.login = async function(email, password) {
    //Validation
    if(!email || !password)
    {
        throw Error('All fileds must be filled.');
    }

    const user = await this.findOne({email});
    if(!user) {
        throw Error('Invalid login credentials.');
    }

    const match = await bcrypt.compare(password, user.password);

    if(!match)
    {
        throw Error('Invalid login credentials.');
    }

    return user;
}

// static signup method
userSchema.statics.signup = async function(email, password) {

    //Validation
    if(!email || !password)
    {
        throw Error('All fileds must be filled.');
    }

    if(!validator.isEmail(email))
    {
        throw Error('Email is not valid.');
    }
    if(!validator.isStrongPassword(password) || password.length < 8)
    {
        throw Error('Password is too weak, it must contain 1 symbol, 1 upper case letter and at least 8 characters long.');
    }

    const exists = await this.findOne({email});
    if(exists) {
        throw Error('Email is already in use.');
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    if(hash)
    {
        const user = await this.create({email, password: hash});

        return user;
    }
}   

module.exports = mongoose.model('User', userSchema);