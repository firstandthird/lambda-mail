'use strict';

const repo = require('../lib/template-repository.js');
const email = require('../lib/email.js');
const logr = require('logr');
const async = require('async');
const log = require('logr')({
  type: 'json'
});;

const GlobalTemplateCache = {};

module.exports.handler = function(event, context) {
  const config = {
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

  if (event.refreshCache == 'refresh'){
    log(['refresh'], 'Cache Refreshed');
    GlobalTemplateCache = {};
    return context.succeed();
  }

  async.auto({
    render: (done) => {
      repo.renderTemplate(config, event, GlobalTemplateCache, done);
    },
    send: ['render', (done, results) => {
      email.sendOneEmail(config, results.render, done);
    }
  }, (err, results) => {
    if (err){
      logr(['error'], err);
      return context.fail(err);
    }
    context.succeed(result);
  });
}
