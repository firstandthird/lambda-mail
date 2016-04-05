'use strict';
// sends emails
const nodemailer = require('nodemailer');
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
    this.transport = nodemailer.createTransport(key);
    this.debugOnly = debugOnly;
  }

  send(to, email, done) {
    const mailObj = {
      to,
      from: `${email.details.fromName} <${email.details.from}>`,
      subject: email.subject,
      html: email.html,
      headers: email.details.headers
    };
    if (this.debugOnly) {
      log(['test'], {
        mailObj,
        template: email.template,
        data: email.data,
        html: email.html
      });
      return done(null);
    }
    this.transport.sendMail(mailObj, (err, info) => {
      if (err) {
        log(['error'], { err, to: mailObj.to, from: mailObj.from, subject: mailObj.subject, template: email.template, data: email.data });
        return done(err);
      }
      log(['sent'], { to: mailObj.to, from: mailObj.from, subject: mailObj.subject, template: email.template, data: email.data });
      done(null, info);
    });
  }
}

module.exports = Email;
