const nodemailer = require('nodemailer')

const sendEmail = async (options) => {
    // Create a transporter 
    const transporter = nodemailer.createTransport({
        host: 'smtp.mailtrap.io',
        port: 2525,
        auth: {
            user: 'cc42ff855a901d',
            pass: '61bcbbdade71bd'
        }
    })

    // Define the email options
    const mailOptions = {
        from: 'customer service <info@natours.io>',
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    // Actually send the email with nodemailer
    await transporter.sendMail(mailOptions)
}

module.exports = sendEmail