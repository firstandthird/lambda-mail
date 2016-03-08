'use strict';
const async = require('async');
const S3 = require('./s3.js');
const TemplateRenderer = require('./template-renderer.js');
const yaml = require('js-yaml');
const Logr = require('logr');
const log = new Logr({
  defaultTags: ['template-repository'],
  type: 'json'
});


class TemplateRepository {
  constructor(partials, helpers, s3config, cache) {
    this.cache = cache;
    this.renderer = new TemplateRenderer();
    this.s3 = new S3(s3config.bucket, s3config.region);
    this.helpers = helpers;
    this.partials = partials;
  }

  loadTemplate(templateName, done) {
    async.auto({
      email: (callback) => {
        const key = `emails/${templateName}/email.html`;
        log(['template'], `Fetching ${templateName} email`);
        this.s3.loadTextObject(key, (err, data) => {
          if (err) {
            return callback(err);
          } else {
            callback(null, {
              html: data,
              render: this.renderer.compileTemplate(data)
            });
          }
        });
      },
      details: (callback) => {
        const key = `emails/${templateName}/details.yaml`;
        log(['template'], `Fetching ${templateName} details`);
        this.s3.loadTextObject(key, (err, data) => {
          if (err) {
            return callback(err);
          }
          const details = yaml.safeLoad(data);
          details.renderSubject = this.renderer.compileTemplate(details.subject);
          callback(null, details);
        });
      }
    }, (err, results) => {
      if (err) {
        return done(err);
      }
      done(null, {
        details: results.details,
        html: results.email.html,
        render: results.email.render
      });
    });
  }

  loadGlobals(allDone) {
    async.auto({
      helpers: (done) => {
        if (!this.helpers) {
          return done();
        }
        async.each(this.helpers, (helper, callback) => {
          this.renderer.registerHelper(helper[0], require(helper[1]));
          callback(null);
        }, done);
      },
      partials: (done) => {
        if (!this.partials) {
          return done();
        }
        async.map(this.partials, (partial, callback) => {
          log(['partial'], `Registering ${partial} partial`);
          this.s3.loadTextObject(`partials/${partial}.html`, (err, data) => {
            if (err) {
              return callback(err);
            }
            this.renderer.registerPartial(partial, data);
            callback(null, data);
          });
        }, done);
      }
    }, (err, results) => {
      allDone(err, results);
    });
  }

  renderTemplate(template, data, allDone) {
    console.log("hi there");

    async.auto({
      template: (done) => {
        if (this.cache[template]) {
          return done();
        }
        this.loadTemplate(template, (err, loadedTemplate) => {
          if (err) {
            return done(err);
          }
          this.cache[template] = loadedTemplate;
          done(null, loadedTemplate);
        });
      },
      globals: (done) => {
        if (this.cache.global) {
          return done();
        }
        this.loadGlobals((err, results) => {
          if (err) {
            return done(err);
          }
          this.cache.global = results;
          done(null, results);
        });
      },
      html: ['template', 'globals', (done, results) => {
        this.renderer.renderTemplate(results.template, data, done);
      }],
      subject: ['template', (done, results) => {
        console.log("results are:");
        console.log(results);
        if (results.template.details.renderSubject) {
          console.log("running details template")
          // results.subject = ;
          done(null, results.template.details.renderSubject(data));
        } else if (data.subject) {
          done(null, this.renderer.renderText(data.subject, data));
        } else {
          done(null, "");
        }
      }]
    }, (err, results) => {
      if (err) {
        return allDone(err);
      }
      allDone(null, {
        html: results.html,
        subject: results.subject,
        details: results.template.details,
        template,
        data
      });
    });
  }
}

module.exports = TemplateRepository;
