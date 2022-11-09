const {Router} = require('hyper-express')
const emailController = require('./email.controller')
const router = new Router()

router.post('forgot-password', emailController.sendingEmails)
module.exports =  router
