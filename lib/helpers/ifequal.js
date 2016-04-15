module.exports = function (val1, val2, options) {
  var context = (options.fn.contexts && options.fn.contexts[0]) || this;
  if(val1 && typeof val1 === 'object') {
    val1 = val1.toString();
  }

  if(val2 && typeof val2 === 'object') {
    val2 = val2.toString();
  }

  if (val1 === val2) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
};
