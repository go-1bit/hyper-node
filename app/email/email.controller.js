const nodemailer = require('nodemailer');
const path = require("path");
const handlebars = require('nodemailer-express-handlebars');


class SendEmail {
    static  sendingEmails = async (req, res, next) => {
        try {
            const handlebarsOpt = {
                viewEngine: {
                    defaultLayout: false
                },
                viewPath: path.resolve('./template'),
                extName: '.ejs'
            }
            const transport = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD
                }
            })
            transport.use('compile', handlebars(handlebarsOpt));
            const options = {
                priority: 'high',
                subject: 'nodemailer email',
                // sender: process.env.SMTP_EMAIL,
                from: process.env.SMTP_EMAIL,
                to: req.body.email,
                template: 'email',
                context: {LINK: 'http://google.com'},
                attachments: [
                    {
                        path: 'template/assets/icon/Logo.png',
                        type: 'image/png',
                        headers: {'Content-ID': '<logo>'},
                        cid: 'logo'
                    },
                    {
                        path: 'template/assets/icon/Layer_x0020_1.png',
                        type: 'image/png',
                        headers: {'Content-ID': '<people>'},
                        cid: 'people'
                    },
                ]
            }
            transport.sendMail(options, (err, info) => {
                if (err) {
                    console.log('Error ', err)
                }
                transport.verify((error, success) => {
                    if (error) {
                        return res.status(409).json({error})
                    }
                    if (success) {
                        return res.status(200).json({
                            status_code: res.status,
                            message: 'Email Sent'
                        })
                    }
                })
            })
            
        } catch (error) {
            return next(error)
        }
    }
}

module.exports = SendEmail
