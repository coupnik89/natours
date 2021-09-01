const dotenv = require('dotenv')
dotenv.config({path: './config.env'})
require('./db/mongoose')
const fs = require('fs')
const path = require('path')
const https = require('https')

const app = require('./app')

const port = process.env.PORT || 8000

// const sslServer = https.createServer({
//     key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
//     cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'))
// }, app)

// const server = sslServer.listen(port, () => {
//     console.log(`(SSL) App is running on port ${port}. ENV ${process.env.NODE_ENV}`) 
// })

server = app.listen(port, () => {
    console.log(`(SSL) App is running on port ${port}. ENV ${process.env.NODE_ENV}`) 
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

