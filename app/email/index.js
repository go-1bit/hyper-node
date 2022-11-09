const {Router} = require('hyper-express');
const emailRoute = require('./email.route')
const router = new Router()

router.use("/email", emailRoute)

module.exports = router
