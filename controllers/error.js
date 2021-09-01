const AppError = require('../utils/AppError')

const sendErrDev = (err, req, res) => {
    // Dev Backend
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        })
    }
    // Dev Frontend
    res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        message: err.message
    })
}


const sendErrProd = (err, req, res) => {
    // Operational error that we trust
    // 1) API
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            })
        }

        // 1) Log the error
        console.log('❌ ERROR ❌', err)

        // Programming or unknown error: don't leak error details
        // 2) Send generic message
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong'
        })
    }
    // 2) For Rendered Website
    if (err.isOperational) {
        if (err.isOperational) {
            return res.status(err.statusCode).render('error', {
                title: 'Something went wrong!',
                message: err.message
            })
        }

        // 1) Log the error
        console.log('❌ ERROR ❌', err)

        // Programming or unknown error: don't leak error details
        // 2) Send generic message
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            message: 'Please try again later.'
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
        sendErrDev(err, req, res)
    } else if (process.env.NODE_ENV === 'production') {
        let errorCopy = {
            ...err
        }
        errorCopy.name = err.name
        errorCopy.message = err.message

        if (errorCopy.name === 'CastError') errorCopy = handleCastError(errorCopy)
        if (errorCopy.code === 11000) errorCopy = handleDuplicateName(errorCopy)
        if (errorCopy.name === 'ValidationError') errorCopy = handleValidationError(errorCopy)
        if (errorCopy.name === 'JsonWebTokenError') errorCopy = handleJWTError()
        if (errorCopy.name === 'TokenExpiredError') errorCopy = handleJWTExpiresError()

        sendErrProd(errorCopy, req, res)
    }
}