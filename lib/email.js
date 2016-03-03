// sends emails
const nodemailer = require('nodemailer');

class Email {
  constructor(smtp, debugOnly) {
    const key = `smtp://${smtp.user}:${smtp.pass}@${smtp.host}:${smtp.port}`;
    this.transport = nodemailer.createTransport(key);
    this.debugOnly = debugOnly;
  }

  send(mail, done) {
    if (this.debugOnly) {
      console.log("Running in mock mode, no email will be sent");
      console.log("From %s to %s", mailOptions.to, mailOptions.from);
      return;
    }
    this.transport.sendMail(mail, (err, info) => {
      if (err) {
        return done(err);
      }
      done(null, info);
    });
  }
}

module.exports = Email;
