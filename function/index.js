'use strict';

const TemplateRepository = require('../lib/template-repository.js');
const Email = require('../lib/email.js');
const logr = require('logr');
const async = require('async');
const log = require('logr')({
  type: 'json'
});

let GlobalTemplateCache = {};

module.exports.handler = (event, context) => {
  const config = {
    debug: process.env.DEBUG,
    smtp: {
      host: process.env.SMTP_HOST,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    s3: {
      bucket: process.env.S3_BUCKET,
      region: process.env.AWS_REGION
    }
  };

  if (event.refreshCache === 'refresh') {
    log(['refresh'], 'Cache Refreshed');
    GlobalTemplateCache = {};
    return context.succeed();
  }

  const repo = new TemplateRepository(config.s3, GlobalTemplateCache);
  const email = new Email(config.smtp, config.debug);

  async.auto({
    render: (done) => {
      repo.renderTemplate(event, done);
    },
    send: ['render', (done, results) => {
      email.sendOneEmail(results.render, done);
    }]
  }, (err, results) => {
    if (err) {
      logr(['error'], err);
      return context.fail(err);
    }
    context.succeed(results);
  });
};
