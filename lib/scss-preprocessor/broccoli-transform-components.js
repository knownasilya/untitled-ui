/* jshint node: true */
'use strict';

var Filter = require('broccoli-persistent-filter');

function extract(pattern, string) {
  var match = string.match(pattern);
  return match && match[1];
}

function Transform(inputTree, options) {
  Filter.call(this, inputTree, options);

  this.moduleNamespace = options.moduleNamespace;
  this.stylesNamespace = options.stylesNamespace;
  this.componentsNamespace = options.componentsNamespace;
}

Transform.prototype = Object.create(Filter.prototype);
Transform.prototype.constructor = Transform;
Transform.prototype.extensions = ['scss'];
Transform.prototype.targetExtension = 'scss';

Transform.prototype.processString = function(content, relPath) {
  var name = extract(this.namePattern(), relPath);
  var processed = content;

  if (name) {
    processed = this.replaceWithMixin(processed, name);
    processed = this.appendMixinClass(processed, name);
  }

  return processed;
};

Transform.prototype.namePattern = function() {
  return new RegExp('^'+this.moduleNamespace+'\/.+\/'+this.stylesNamespace+'\/'+this.componentsNamespace+'\/(.+)\.scss$');
};

Transform.prototype.replaceWithMixin = function(content, name) {
  return content.replace(/@component/, '@mixin ' + name);
};

Transform.prototype.appendMixinClass = function(content, name) {
  var processed = content;

  // ensure EOF newline
  if (!/\n$/.test(processed)) {
    processed += '\n';
  }

  return processed+'\n.'+name+' {\n'+'  @include '+name+'();\n}\n';
};

module.exports = Transform;
