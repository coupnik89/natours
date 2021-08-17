const express = require('express')
const Router = express.Router()

const utils = require('../utils/isLoggedIn')

const viewsController = require('../controllers/views')

Router.use(utils.isLoggedIn)

Router.get('/', viewsController.getOverview)

Router.get('/login', viewsController.getLogin)

Router.get('/tour/:slug', viewsController.getTourView)

module.exports = Router