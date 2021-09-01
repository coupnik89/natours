const express = require('express')
const Router = express.Router()

const utils = require('../utils/isLoggedIn')

const viewsController = require('../controllers/views')

// testing cookie
const authController = require('../controllers/auth')

Router.get('/me', authController.authenticate, viewsController.getAccount)

Router.post('/submit-user-data', authController.authenticate, viewsController.updateUserData)

// IsLoggedIn apply to routes after this

Router.use(utils.isLoggedIn)

Router.get('/', viewsController.getOverview)

Router.get('/login', viewsController.getLogin)

Router.get('/tour/:slug', viewsController.getTourView)

module.exports = Router