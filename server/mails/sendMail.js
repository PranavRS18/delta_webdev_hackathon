const fs = require('fs');
const nodemailer = require("nodemailer");
require("dotenv").config();

module.exports.sendMail = async (user) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        }
    });
    let template = fs.readFileSync(__dirname + `/templates/${user.template}_mail.html`, 'utf8');
    template = template.replaceAll('{{ username }}', user.username);
    template = template.replaceAll('{{ email }}', user.email);
    template = template.replaceAll('{{ date }}', new Date().toString());
    template = template.replaceAll('{{ appName }}', process.env.NAME);

    let subject;
    if (user.template === 'welcome') {
        template = template.replaceAll('{{ link }}', process.env.SERVER + `/api/auth/verified?token=${user.token}`);
        subject = `Welcome to ${process.env.NAME}!`;
    }

    else if (user.template === 'forgotPassword') {
        template = template.replaceAll('{{ link }}', process.env.CLIENT + `/reset-password?token=${user.token}`);
        subject = `${process.env.NAME} Password Reset Request – Action Required`;
    }

    return await transporter.sendMail({
        from: process.env.EMAIL,
        to: user.email,
        subject: subject,
        html: template,
    }).then().catch(err => {
        return err.responseCode;
    });
}