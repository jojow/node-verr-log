var debug = require('debug')(require('./package.json').name);
var _ = require('lodash');
var prettyjson = require('prettyjson');
var stringify = require('json-stringify-safe');



module.exports = function(spec) {
  spec = spec || {};

  spec.error = spec.error || console.error;
  spec.info = spec.info || console.log;
  spec.debug = spec.debug || debug;

  if (!_.isBoolean(spec.pretty)) spec.pretty = true;
  if (!_.isBoolean(spec.color)) spec.color = true;

  //TODO: support clean JSON output for all logging functions
  if (!_.isBoolean(spec.json)) spec.json = false;

  var obj = {};

  obj.error = obj.err = function(err, prefix) {
    if (!err) return;

    prefix = prefix || '';

    var clonedErr = _.clone(err);

    delete clonedErr.domain;
    delete clonedErr.domainThrown;
    delete clonedErr.jse_shortmsg;
    delete clonedErr.jse_summary;
    delete clonedErr.jse_cause;

    clonedErr.time = new Date().toString();

    var dump = stringify(clonedErr);
    
    try {
      if (spec.pretty) dump = '\n    ' + prettyjson.render(JSON.parse(dump), { noColor: !spec.color }).split('\n').join('\n    ');
    } catch (err) {}

    var message = err.stack || err.message || err;

    if (message.toString && !_.isString(message)) message = message.toString().trim();

    var output = prefix + message + '\n  Error object dump: ' + dump;

    if (err.cause && err.cause()) obj.error(err.cause(), output + '\n  Caused by: ');
    else spec.error(output);
  };

  obj.info = spec.info;

  obj.debug = spec.debug;

  return obj;
};
