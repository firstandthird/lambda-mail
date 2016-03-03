// sends emails
var nodemailer = require('nodemailer');

// in the future we may use different or multiple
// transporters
var mandrillTransporter = false;
module.exports.initializeTransport = function initializeTransport(config) {
  var key = 'smtp://' + config.mandrill.login + ':' + config.mandrill.password + '@' + config.mandrill.host + ':' + config.mandrill.port;
  if (config.dev) {
    console.log('creating transporter %s', key);
  }
  mandrillTransporter = nodemailer.createTransport(key);
};

module.exports.sendOneEmail = function sendOneEmail(config, mailOptions, callback) {
  if (config.dontSend){
    console.log("Running in mock mode, no email will be sent");
    console.log("From %s to %s", mailOptions.to, mailOptions.from);
    return;
  }
  if (!mandrillTransporter) {
    module.exports.initializeTransport(config);
  }
  mandrillTransporter.sendMail(mailOptions, function emailCallback(error, info) {
    if (error) {
      return callback(error);
    } else if (config.dev) {
      console.log('Message sent: ' + info.response);
    }
    callback(null, info);
  });
};
