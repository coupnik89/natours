const { promisify } = require('util')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { decode } = require('punycode')

const userSchema = new mongoose.Schema({
    type: {
        type: String,
        default: 'user'
    },
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        min: [1, 'Name must be greater than 1 character'],
        max: [25, 'Name must be less than 25 characters']
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: [true, 'Please provide a email'],
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: {
        type: String
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    active: {
        type: Boolean,
        default: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        min: [6, 'Password must be at least 6 characters']
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (val) {
                return val === this.password
            },
            message: 'Passwords do not match!'
        }
    },
    passwordChangedAt: {
        type: Date
    },
    passwordResetToken: String,
    passwordResetExpires: Date
})

userSchema.pre('save', function(next) {
    if(!this.isModified('password') || this.isNew) return next()

    this.passwordChangedAt = Date.now() - 1000
    next()
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password, 12)

    this.passwordConfirm = undefined

    next()
})

userSchema.pre(/^find/g, async function(next) {
    this.find({ active: {
        $ne: false
    }})

    next()
})

userSchema.methods.generateAuthToken = function(expires = '30d') {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
        expiresIn: expires
    })

    return token
}

userSchema.methods.isPwChangedAfterTknIssued = function(JWTTimestamp) {
    if(this.passwordChangedAt) {
        const changedTimeStamp = this.passwordChangedAt.getTime() / 1000

        console.log(changedTimeStamp , JWTTimestamp)

        return JWTTimestamp < changedTimeStamp
    }
    
    // False = not changed
    return false 
}

userSchema.statics.findByCredentials = async function(email, password) {
    const user = await User.findOne({ email })

    if(!user) return false 

    const isMatch = await bcrypt.compare(password, user.password)

    if(isMatch) return user
}

userSchema.statics.verifyToken = async function(token) {
    let user 
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    user = await User.findById(decoded._id)

    user.JWTTimestamp = decoded.iat

    return user 
}

userSchema.methods.toJSON = function() {
    const userObj = this.toObject()

    delete userObj.password
    delete userObj.active
    delete userObj.passwordChangedAt
    delete userObj.passwordResetExpires
    delete userObj.passwordResetToken

    return userObj
}

const User = mongoose.model('User', userSchema)

module.exports = User