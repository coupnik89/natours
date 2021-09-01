const nodemailer = require('nodemailer')
const nodemailerSendgrid = require('nodemailer-sendgrid')
const pug = require('pug')
const htmlToText = require('html-to-text')

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email
        this.from = process.env.EMAIL_FROM,
            this.firstName = user.name.split(' ')[0]
        this.url = url
    }

    transporter() {
        if (process.env.NODE_ENV === 'production') {
            // Sendgrid: real email
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            })
        }

        // To mailtrap
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        })
    }

    // Actul send email
    async send(template, subject) {
        // 1) Render HTMl base on a pug template
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        })

        // 2) Define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject: subject,
            html: html,
            text: htmlToText.htmlToText(html)
        }

        // 3) Create transport and send email
        await this.transporter().sendMail(mailOptions)
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to Natours Family!')
    }

    async sendPasswordReset() {
        await this.send('passwordReset', 'Reset your password (Valid for 10 mintues)')
    }
}

// const sendEmail = async (options) => {
//     // Define the email options
//     const mailOptions = {
//         from: 'customer service <info@natours.io>',
//         to: options.email,
//         subject: options.subject,
//         text: options.message
//     }

//     // Actually send the email with nodemailer
//     await transporter.sendMail(mailOptions)
// }