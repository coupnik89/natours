const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
dotenv.config({ path: `${path.join(__dirname, '../config.env')}`})

const mongoose = require('mongoose')
const Tour = require('../Models/tour')
const User = require('../Models/user')
const Review = require('../Models/review')

const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PW)

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(connection => {
    console.log('DB connection successful');
})

const tours = JSON.parse(fs.readFileSync(`${path.join(__dirname, '../dev-data/data/tours.json')}`, 'utf-8'))
const users = JSON.parse(fs.readFileSync(`${path.join(__dirname, '../dev-data/data/users.json')}`, 'utf-8'))
const reviews = JSON.parse(fs.readFileSync(`${path.join(__dirname, '../dev-data/data/reviews.json')}`, 'utf-8'))


const importDevDatas = async () => {
    try {
        await Tour.create(tours)
        await User.create(users, {
            validateBeforeSave: false
        })
        await Review.create(reviews)
        console.log('Data successfully loaded')
    } catch (err) {
        console.log(err)
    }
    process.exit()
}

const deleteDevDatas = async () => {
    try {
        await Tour.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
        console.log('Data successfully deleted')
    } catch (err) {
        console.log(err)
    }
    process.exit()
}

// USER DEV DATA
const importDevUsers = async () => {
    try {
        await User.create(tours)
        console.log('User data successfully loaded')
    } catch (err) {
        console.log(err)
    }
    process.exit()
}

const deleteDevUsers = async () => {
    try {
        await User.deleteMany()
        console.log('User data successfully deleted')
    } catch (err) {
        console.log(err)
    }
    process.exit()
}

if(process.argv[2] === '--import') {
    importDevDatas()
} else if (process.argv[2] === '--delete') {
    deleteDevDatas()
}

if(process.argv[2] === '--import-users') {
    importDevUsers()
} else if (process.argv[2] === '--delete-users') {
    deleteDevUsers()
}