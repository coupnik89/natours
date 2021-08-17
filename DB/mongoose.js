const mongoose = require('mongoose')

const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PW)

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(connection => {
    console.log('DB connection successful');
})