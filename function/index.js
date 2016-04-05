'use strict';

const TemplateRepository = require('../lib/template-repository.js');
const Email = require('../lib/email.js');
const async = require('async');
const Logr = require('logr');
const log = new Logr({
  defaultTags: ['handler'],
  type: 'json',
  renderOptions: {
    json: {
      tagsObject: true
    }
  }
});

let GlobalTemplateCache = {};

const splitIfExists = (val) => {
  return (val) ? val.split(',') : [];
};

const config = {
  debug: process.env.DEBUG,
  partials: splitIfExists(process.env.PARTIALS),
  helpers: splitIfExists(process.env.HELPERS),
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

const repo = new TemplateRepository(config.partials,
   config.helpers, config.s3, GlobalTemplateCache);
const email = new Email(config.smtp, config.debug);

module.exports.handler = (event, context) => {
  if (event.refreshCache === 'refresh') {
    log(['refresh'], 'Cache Refreshed');
    GlobalTemplateCache = {};
    return context.done(null, 'Cache refreshed');
  }
  if ((!event.template && !event.text) || !event.to) {
    return context.fail('missing template and to');
  }

  async.auto({
    render: (done) => {
      if (event.text) {
        return done(null, {
          details: {
            from: event.from,
            fromName: event.fromName
          },
          subject: event.subject,
          text: event.text
        });
      }
      repo.renderTemplate(event.template, event.data, done);
    },
    send: ['render', (done, results) => {
      email.send(event.to, results.render, done);
    }]
  }, (err, results) => {
    if (err) {
      log(['error'], err);
      return context.fail(err);
    }
    context.succeed(results.send);
  });
};
