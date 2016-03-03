var handlebars = require('handlebars');
var _ = require('lodash');

class TemplateRenderer {
  constructor(templateCache) {
    this.templateCache = templateCache;
  }

  compileTemplate(templateText) {
    return handlebars.compile(templateText);
  }

  renderText(templateText, config) {
    return this.compileTemplate(templateText)(config);
  }

  registerPartial(name, partial) {
    handlebars.registerPartial(name, partial);
  };

  registerHelper(name, helper) {
    handlebars.registerHelper(name, helper);
  };

  renderTemplate(context) {
    var temp = _.clone(context);
    _.each(templateCache[context.template].details, function each(val, key) {
      if (key!=='subject')
        temp[key] = val;
    });
    if (temp.subject) {
      console.log("setting template!!!!!!!!!! %s", temp.subject);
      console.log(temp.to);
      temp.subject = handlebars.compile(temp.subject)(temp);
    } else if (templateCache[temp.template].details.subject) {
      console.log("setting %s",templateCache[temp.template].details.subject );
      temp.subject = templateCache[temp.template].details.subject(temp);
    }
    context.subject = temp.subject;
    return templateCache[context.template].email({
      data: temp
    });
  }
}

module.exports = TemplateRenderer;
