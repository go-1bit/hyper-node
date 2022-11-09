const multer = require('multer')
const fs = require('fs')
const customStorage = require('../utils/multer.upload')


const storage = customStorage({
    destination: (req, file, cb) => {
        console.log(file.data)
        // const dFile = fs.readFileSync(file.originalname)
        // console.log(dFile)
        // console.log(file)
        // console.log('buffer', file)
        cb(null, file.fieldname)
    }
})
const upload = multer({
    storage
})
module.exports = {upload}
