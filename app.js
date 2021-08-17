const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')

const path = require('path')

const tourRouter = require('./routes/tour');
const userRouter = require('./routes/user')
const reviewRouter = require('./routes/review')
const viewRouter = require('./routes/views')

const AppError = require('./utils/AppError')
const errorController = require('./controllers/error')

const app = express();

// View engine
app.set('view engine', 'pug')

// Path to view folder
app.set('views', path.join(__dirname, 'views'))

// Serving static files
app.use(express.static(path.join(__dirname, 'public')))

// Set security HTTP headers
app.use(helmet())

//*** MIDDLEWARE ***
// Development logging
if(process.env.NODE_ENV =='development') {
    app.use(morgan('dev'));
};

// Limiting require from the same IP
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Request limit reached. Please try again in 1 hour.'
})

app.use('/api', limiter)

// Body parser, reading data from ody into req.body
app.use(express.json({
    limit: '10kb'
}));

// Cookie parser
app.use(cookieParser())

// app.use(session({
//     secret: 'something123',
//     saveUninitialized: false,
//     resave: true
// }))

// app.use(flash())

// Global variables 
// app.use((req, res, next) => {
//     res.locals.success_msg = req.flash('success_msg')
//     res.locals.error_msg = req.flash('error_msg')
//     next()
// })

// Data sanitization against NoSQL query injection
app.use(mongoSanitize())

// Data sanitization again xss e.g <div id="attacks">Name</div>
app.use(xss())

app.use((req, res, next) => {   
    console.log(req.cookies)
    next()
})

// ROUTES 
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/', viewRouter)

app.all('*', (req, res, next) => {
    next(new AppError(404, `Page NOT found URL: ${req.originalUrl}`))
})

app.use(errorController)

//*** EXPORT APP ***
module.exports = app;