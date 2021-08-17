class AppError extends Error {
    constructor(statusCode, msg) {
        super(msg) 
        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith(4) ? 'failed' : 'error'
        this.isOperational = true

        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = AppError