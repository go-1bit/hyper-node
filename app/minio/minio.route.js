const {Router} = require('hyper-express')
const minioController = require('./minio.controller')
const router = new Router()
// const {uploading} = require('../../utils/upload')


router.get('/bucket', minioController.getBuckets)
router.post('/bucket', minioController.createBucket)
router.delete('/bucket', minioController.deleteBucket)
router.post('/upload', minioController.upload)
router.get('/object', minioController.getListObject)
router.delete('/object', minioController.deleteObject)
router.delete('/objects', minioController.deleteObjects)

module.exports = router
