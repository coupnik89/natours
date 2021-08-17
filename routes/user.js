const express = require('express')

const router = express.Router()

const userController = require('../controllers/user')
const authController = require('../controllers/auth')


router.get('/something', (req, res, next) => {
    res.status(200).json({
        status: 'success',
        message: 'all done!'
    })
    next()
})
router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.post('/forgotPassword', authController.forgotPassword)

router.patch('/resetPassword/:token', authController.resetPassword)

// Run authenticate middleware 
router.use(authController.authenticate)

router.patch('/updatePassword', authController.updatePassword)

router.get('/currentUser', userController.getSelf, userController.getUser)
router.patch('/updateSelf', userController.updateSelf)
router.delete('/deleteSelf', userController.deleteSelf)

router.route('/')
    .get(userController.getUsers)



module.exports = router