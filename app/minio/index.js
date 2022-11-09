const {Router} = require('hyper-express');
const minioRoute = require('./minio.route')
const router = new Router()

router.use("/", minioRoute)

module.exports = router
