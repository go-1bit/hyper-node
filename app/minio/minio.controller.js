const Minio = require('minio')
const crypto = require("crypto");
const {PostPolicy} = require("minio");

class MinioController {
    // static Client = new Minio.Client({
    //     endPoint: 's3.amazonaws.com',
    //     accessKey: process.env.AWSACCESSKEY,
    //     secretKey: process.env.AWSSECRETKEY,
    //     ACL: "public-read",
    // "endPoint": "127.0.0.1",
    // "ACCESSKEY": "usertest1",
    // "SECRETKEY": "testuser",
    //  "MINIOPORT":"9000"
    // })

    static Client = new Minio.Client({
        endPoint: `${process.env.endPoint || 's3.amazonaws.com'}`,
        port: parseInt(`${process.env.MINIOPORT || 80}`),
        useSSL: false,
        accessKey: `${process.env.ACCESSKEY || process.env.AWSACCESSKEY}`,
        secretKey: `${process.env.SECRETKEY || process.env.AWSSECRETKEY}`,
    })

    static getBuckets = async (req, res, next) => {
        try {
            const lBucket = await this.Client.listBuckets()
            return res.status(200).json(lBucket)
        } catch (err) {
            console.log(err)
            return next(err)
        }
    }
    static createBucket = async (req, res, next) => {
        try {
            this.Client.bucketExists(`${req.body.name}`, (err, exist) => {
                if (err) console.log(err)
                if (exist) return res.status(400).json({
                    status: res.status,
                    message: "Bucket Already Exist"
                })
                if (!err && !exist) {
                    this.Client.makeBucket(`${req.body.name}`, 'ap-southeast-1', (err) => {
                        if (err) console.log(err)
                        const policy = {
                            "Version": "2012-10-17",
                            "Statement": [
                                {
                                    "Action": [
                                        "s3:PutObject",
                                        "s3:GetObject",
                                        "s3:DeleteObject"
                                    ],
                                    "Principal": {
                                        "AWS": [
                                            "*"
                                        ]
                                    },
                                    "Effect": "Allow",
                                    "Resource": [
                                        "arn:aws:s3:::${req.body.name}/*"
                                    ],
                                    "Sid": ""
                                }
                            ]
                        }
                        if (!err) {
                            this.Client.setBucketPolicy(`${req.body.name}`, JSON.stringify(policy), (err) => {
                                console.log(err)
                            })
                        }
                        return res.status(201).json({
                            status: res.status,
                            message: 'Bucket Successfully Created'
                        })
                    })
                }
            })
        } catch (err) {
            console.log(err)
            return next(err)
        }
    }
    static deleteBucket = async (req, res, next) => {
        try {
            this.Client.bucketExists(`${req.body.name}`, (err, exist) => {
                if (err) console.log(err)
                // const objectList = this.Client.listObjects(req.body.name, '', true)
                // const listObject = []
                // objectList.on('data', (obj) => {
                //     listObject.push(obj.name)
                // })
                // objectList.on('end', () => {
                //     console.log(listObject)
                // })
                if (!err && exist) {
                    this.Client.removeBucket(`${req.body.name}`, (err, info) => {
                        if (err) console.log(err)
                        console.log(info)
                        return res.status(200).json({
                            status: res.status,
                            message: 'Bucket Successfully Deleted'
                        })
                    })
                }
            })
        } catch (err) {
            console.log(err)
        }
    }
    static upload = async (req, res, next) => {
        console.log(req.body)
        this.Client.bucketExists(`${req.body.name}`, (err, exist) => {
            if (err) console.log(err)
            if (exist) {
                const fileData = req.files.image
                // console.log(fileData)
                let fileName = Date.now() + crypto.randomBytes(16).toString("hex") + "." + (fileData.name).split('.')[1];
                console.log('logger')
                this.Client.putObject(`${req.body.name}`, `${req.body.folder_path}/${fileName}`, fileData.data, {
                    'Content-Type': `${fileData.mimetype}`,
                    // 'x-amz-acl': 'public-read',
                }, (err, data) => {
                    const url = `${this.Client.protocol}//${req.body.name}.${this.Client.host}/${fileName}`
                    this.Client.presignedUrl('GET', req.body.name, fileName, 24 * 60 * 60, (err, URI) => {
                        if (err) console.log(err)
                        // console.log(URI)
                        if (!err) {
                            return res.status(200).json({
                                status: res.status,
                                url: URI
                            })
                        }

                    })
                })
            }
        })
    }
    static getListObject = async (req, res, next) => {
        try {
            const list = await this.Client.listObjects(`${req.body.bucket}`, '', true)
            const listObject = []
            list.on('data', async (object) => {
                console.log(object)
                listObject.push(object)
            })
            list.on('end', () => {
                return res.status(200).json(listObject)
            })

        } catch (e) {
            return res.status(500).json({
                message: e.message
            })
        }

    }
    static deleteObject = async (req, res, next) => {
        try {
            const list = await this.Client.listObjects(`${req.body.bucket}`, '', true)
            const listObject = []
            list.on('data', async (object) => {
                // console.log(object)
                listObject.push(object)
            })
            list.on('end', () => {
                // console.log(listObject[0].name)
                this.Client.removeObject(req.body.bucket, listObject[0].name, (err, info) => {
                    console.log(err, '====', info)
                    if (err) {
                        return res.status(500).json({
                            message: err.message
                        })
                    }
                    return res.status(200).json(listObject)
                })
            })
        } catch (err) {
            return res.status(500).json({
                message: err.message
            })
        }
    }
    static deleteObjects = async (req, res, next) => {
        try {
            const list = await this.Client.listObjects(`${req.body.bucket}`, '', true)
            const listObject = []
            list.on('data', async (object) => {
                // console.log(object)
                listObject.push(object.name)
            })
            list.on('end', () => {
                // console.log(listObject[0].name)
                this.Client.removeObjects(req.body.bucket, listObject, (err, info) => {
                    console.log(err, '====', info)
                    if (err) {
                        return res.status(500).json({
                            message: err.message
                        })
                    }
                    return res.status(200).json(listObject)
                })
            })
        } catch (err) {
            return res.status(500).json({
                message: err.message
            })
        }
    }

}

module.exports = MinioController
