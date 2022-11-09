const {Server} = require('hyper-express');
const bodyParser = require("body-parser");
const app = new Server();
const cors = require('cors');
const emailRoute = require('./app/email')
const minioRoute = require('./app/minio')
const fileUpload = require('express-fileupload')


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload({
    limits: {fileSize: 50 * 1024 * 1024 * 1024}
}));


app.use('/', emailRoute)
app.use('/minio', minioRoute)

app.listen(process.env.PORT).then(
    (socket) => {
        console.log('Running on ', process.env.PORT)
    }
).catch(err => {
    console.log(err)
})

module.exports = app

