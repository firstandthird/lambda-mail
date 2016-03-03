var Handlebars = require('handlebars');
var fs = require('fs');
var path = require('path');
var s3 = require('../s3.js');

module.exports = function (type, filename) {
  if (!filename) {
    return;
  }

  var filePath = this._server.methods.getAsset(filename, type);
  filename = path.join(__dirname, '../public/'+filePath);
  var src = fs.readFileSync(filename, 'utf8');

  var out = '';
  if (type == 'css') {
    out = '<style>'+src+'</style>';
  } else if (type == 'js') {
    out = '<script>'+src+'</style>';
  }
  return new Handlebars.SafeString(out);
};
