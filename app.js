const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const cookieParser = require('cookie-parser')
const crypto = require('crypto')

const path = require('path')

const tourRouter = require('./routes/tour');
const userRouter = require('./routes/user')
const reviewRouter = require('./routes/review')
const viewRouter = require('./routes/views')

const AppError = require('./utils/AppError')
const errorController = require('./controllers/error')

const app = express();

// app.use(helmet.contentSecurityPolicy({
//     directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: ["'self'", 'https://*.mapbox.com'],
//         scriptSrc: ["'self'", 'https://*.cloudflare.com'],
//         styleSrc: ["'self'", 'https://*.mapbox.com'],
//         styleSrc: ["'self'", 'fonts.googleapis.com'],
//         fontSrc: ["'self'", 'fonts.gstatic.com']
//     }
// }));

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'", 'data:', 'blob:'],
//       baseUri: ["'self'"],
//       styleSrc: [
//           "'self'",
//           (req, res) => {
//             res.styleNonce = crypto.randomBytes(16).toString("base64");
//             return `'nonce-${res.styleNonce}'`;
//           },
//         ],
//     styleSrc: ["'self'", 'fonts.googleapis.com'],
//       scriptSrc: ["'self'", 'https://*.cloudflare.com'],
//       scriptSrc: ["'self'", 'https://*.stripe.com'],
//       scriptSrc: ["'self'", 'http:', 'https://*.mapbox.com', 'data:'],
//       frameSrc: ["'self'", 'https://*.stripe.com'],
//       objectSrc: ["'none'"],
//       fontSrc: ["'self'", 'fonts.gstatic.com'],
//       workerSrc: ["'self'", 'data:', 'blob:'],
//       childSrc: ["'self'", 'blob:'],
//       imgSrc: ["'self'", 'data:', 'blob:'],
//       connectSrc: ["'self'", 'blob:', 'https://*.mapbox.com'],
//       upgradeInsecureRequests: []
//     },
//     referrerPolicy: { policy: "same-origin" }
//   })
// );

// app.use(helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: [(req, res) => `'nonce-${res.locals.nonce}'`],
//       scriptSrc: ["'self'", 'https://api.mapbox.com'],
//       scriptSrc: ["'self'", 'cdnjs.cloudflare.com'],
//       styleSrc: ["'self'", 'fonts.googleapis.com'],
//       fontSrc: ["'self'", 'fonts.gstatic.com']
//     },
// }))

// View engine
app.set('view engine', 'pug')

// Path to view folder
app.set('views', path.join(__dirname, 'views'))

// Serving static files
app.use(express.static(path.join(__dirname, 'dist')))
app.use(express.static(path.join(__dirname, 'public')))



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

// Data sanitization against NoSQL query injection
app.use(mongoSanitize())

// Data sanitization again xss e.g <div id="attacks">Name</div>
app.use(xss())

app.use('/api', limiter)

// Body parser, reading data from ody into req.body
app.use(express.json({
    limit: '10kb'
}));

// Parse form data
app.use(express.urlencoded({
    extended: true,
    limit: '10kb'
}))

// XSS
app.use((req, res, next) => {   
    res.locals.nonce = crypto.randomBytes(16).toString('base64')
    next()
})

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: "'self'",
        baseUri: ["'self'"],
        scriptSrc: ["'self'", 'cdnjs.cloudflare.com', 'api.mapbox.com', (req, res) => `'nonce-${res.locals.nonce}'`],
        styleSrc: ["'self'", 'fonts.googleapis.com', 'api.mapbox.com', (req, res) => `'nonce-${res.locals.nonce}'`],
        fontSrc: ["'self'", 'fonts.gstatic.com'],
        connectSrc: ["'self'", 'blob:', 'https://*.mapbox.com', 'ws://localhost:*'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        workerSrc: ["'self'", 'data:', 'blob:'],
        styleSrcAttr: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
        
    },
    reportOnly: true
}))

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

// app.use((req, res, next) => {
//   res.set(
//     'Content-Security-Policy',
//     "script-src 'self' https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.1/axios.min.js 'unsafe-inline' 'unsafe-eval';"
//   );
//   next();
// });

// *************** TEST *****************
app.use((req, res, next) => {   
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