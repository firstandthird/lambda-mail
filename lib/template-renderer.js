'use strict';
const handlebars = require('handlebars');
const _ = require('lodash');
const Logr = require('logr');
const log = new Logr({
  defaultTags: ['s3'],
  type: 'json'
});

class TemplateRenderer {
  compileTemplate(templateText) {
    return handlebars.compile(templateText);
  }

  renderText(templateText, data) {
    return this.compileTemplate(templateText)(data);
  }

  registerPartial(name, partial) {
    handlebars.registerPartial(name, partial);
  }

  registerHelper(name, helper) {
    handlebars.registerHelper(name, helper);
  }

  renderTemplate(templateObj, context, done) {
    const emailContext = _.merge(templateObj.details.data, context);
    const rendered = templateObj.render(emailContext);
    done(null, rendered);
  }
}

module.exports = TemplateRenderer;
