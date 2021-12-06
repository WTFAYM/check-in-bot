const nodemailer = require('nodemailer');

const host = process.env.MAIL_HOST;
const port = Number(process.env.MAIL_PORT);
const user = process.env.MAIL_USER;
const pass = process.env.MAIL_PASS;
const to = process.env.MAIL_TO;

const sendMail = async (title, content) => {
    let transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
            user,
            pass,
        },
    });

    let info = await transporter.sendMail({
        from: `"Check-In Bot" <${user}>`,
        to,
        subject: title,
        text: content,
    });
    return info;
};

module.exports = {
    sendMail,
}