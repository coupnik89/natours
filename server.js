const dotenv = require('dotenv')
dotenv.config({path: './config.env'})
require('./db/mongoose')

const app = require('./app')

const port = process.env.PORT || 8000

const server = app.listen(port, () => {
    console.log(`App is running on port ${port}. ENV ${process.env.NODE_ENV}`) 
})

// Listening to all unhandlerejection events
process.on('unhandledRejection', err => {
    console.log(err.name, err.message)
    console.log('❌ UNHANDLE REJECTION! ❌')

    // Give the server time to finish all the request 
    server.close(() => {
        // Shut down the server
        process.exit(1)
    })
})

