const async = require('async');
const s3 = require('./s3.js');
const TemplateRenderer = require('./rendering.js');
const yaml = require('js-yaml');

class TemplateRepository {
  constructor(config, cache) {
    this.config = config;
    this.cache = cache;
    this.renderer = new TemplateRenderer(cache);
  }

  loadTemplate(templateName, done) {
    async.auto({
      email: (callback) => {
        const key = `emails/${templateName}/email.html`;
        s3.loadTextObject(this.config, templateName, key, (err, data) => {
          if (err) {
            callback(err);
          } else {
            const email = this.renderer.compileTemplate(data);
            callback(null, email);
          }
        });
      },
      details: (callback) => {
        const key = `emails/${templateName}/details.yaml`;
        s3.loadTextObject(this.config, templateName, key, (err, data) => {
          if (err) {
            return callback(err);
          }
          const details = yaml.safeLoad(data);
          details.subject = details.subject ?
            this.renderer.compileTemplate(details.subject) : undefined;
          callback(null, details);
        });
      }
    }, (err, results) => {
      done(err, results);
    });
  }

  loadGlobals(allDone) {
    async.auto({
      helpers: (done) => {
        async.each(this.config.helpers, (helper, callback) => {
          this.renderer.registerHelper(helper[0], require(helper[1]));
          callback(null);
        }, done);
      },
      partials: (done) => {
        async.each(this.config.partials, (partial, callback) => {
          s3.loadTextObject(this.config, 'global', partial[1], (err, data) => {
            if (err) {
              return callback(err);
            }
            this.renderer.registerPartial(partial[0], data);
            callback(null);
          });
        }, done);
      }
    }, (err, results) => {
      allDone(err, results);
    });
  }

  // ensures that templateCache is populated
  populateHandlebars(request, allDone) {
    const tempCache = this.cache;
    async.auto({
      template: (done) => {
        if (tempCache[request.template]) {
          return done();
        }
        this.loadTemplate(request.template, (err, loadedTemplate) => {
          tempCache[request.template] = loadedTemplate;
          done(err, tempCache);
        });
      },
      populateGlobal: (done) => {
        if (tempCache.global) {
          return done(null, tempCache);
        }
        this.loadGlobals((err) => {
          done(err, tempCache);
        });
      },
    }, (err) => {
      allDone(err, tempCache);
    });
  }

  renderTemplate(request, done) {
    this.populateHandlebars(request, (err, populatedTemplateCache) => {
      const requestToReturn = request;
      requestToReturn.config = this.config;
      requestToReturn.html = this.renderer.renderTemplate(populatedTemplateCache, requestToReturn);
      done(err, request);
    });
  }
}

module.exports = TemplateRepository;
