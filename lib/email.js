'use strict';
// sends emails
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const mandrill = require('mandrill-api/mandrill');
const manClient = new mandrill.Mandrill(process.env.SMTP_PASS);

const Logr = require('logr');
const log = new Logr({
  defaultTags: ['email'],
  type: 'json',
  renderOptions: {
    json: {
      tagsObject: true
    }
  }
});

class Email {
  constructor(smtp, debugOnly) {
    const key = `smtp://${smtp.user}:${smtp.pass}@${smtp.host}:${smtp.port}`;
    this.transport = nodemailer.createTransport(smtpTransport(key));
    this.debugOnly = debugOnly;
  }

  send(to, email, done) {
    const manMailObj = {
      html: email.html,
      text: email.text,
      from_email: email.details.from,
      from_name: email.details.fromName,
      to: [{ email: to }],
      subject: email.subject,
      headers: email.details.headers,
      inline_css: true
    };

    manClient.messages.send({ message: manMailObj, async: true }, (res) => {
      done(null, res);
    });
  }
}

module.exports = Email;
