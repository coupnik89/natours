const AppError = require('../utils/AppError')

const sendErrDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    })
}

const sendErrProd = (err, res) => {
    // Operational error that we trust
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    } else {
        // Programming or unknown error: don't leak error details
        // 1) Log the error
        console.log('❌ ERROR ❌', err)

        // 2) Send generic message
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong'
        })
    }
}

const handleCastError = (err) => {
    const message = `Invalid  ${err.path}: ${err.value}`
    return new AppError(400, message)
}

const handleDuplicateName = (err) => {
    const message = `${err.keyValue.name || err.keyValue.email} already exist. Try another one!`
    return new AppError(400, message)
}

const handleValidationError = (err) => {
    const errorsMsg = Object.values(err.errors).map(el => el.message)

    return new AppError(400, errorsMsg.join('. '))
}

const handleJWTError = () => new AppError(401, 'Invalid token. Please login or signup')

const handleJWTExpiresError = () => new AppError(401, 'Token Expired. Please login')

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'

    if (process.env.NODE_ENV === 'development') {
        sendErrDev(err, res)
    } else if (process.env.NODE_ENV === 'production') {
        let errorCopy = {...err}
        errorCopy.name = err.name

        if(errorCopy.name === 'CastError') errorCopy = handleCastError(errorCopy)
        if(errorCopy.code === 11000) errorCopy = handleDuplicateName(errorCopy)
        if(errorCopy.name === 'ValidationError') errorCopy = handleValidationError(errorCopy)
        if(errorCopy.name === 'JsonWebTokenError') errorCopy = handleJWTError()
        if(errorCopy.name === 'TokenExpiredError') errorCopy = handleJWTExpiresError()
        
        sendErrProd(errorCopy, res)
    }
}