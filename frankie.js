var Frankie = (function() {
  
  // Init module

  var module = {};

  // Version

  module.versionMajor = 0;
  module.versionMinor = 0;
  module.versionRevision = 1;
  module.version = [
    module.versionMajor,
    module.versionMinor,
    module.versionRevision
  ].join('.');

  // Utils

  var NAMED_PARAMS_RE = /:[a-z][a-zA-Z0-9]*/g
  var PARAMS_RE = /(:[a-z][a-zA-Z0-9]*|\*)/g

  var stripSlashes = function(path) {
    return path.toString().replace(/^\/|\/$/g, '');
  };

  var buildRegExp = function(path) {
    path = stripSlashes(path);
    path = path.replace(/\./g, '\\.')
    path = path.replace(NAMED_PARAMS_RE,'([^\\/]+)')
    path = path.replace(/\*/g, '(.*)')
    return new RegExp('^'+path+'$');
  };

  var buildParamNames = function(path) {
    var list = path.match(PARAMS_RE);
    if (!list) return [];
    for (var i=0; i<list.length; i++) {
      list[i] = list[i].replace(':', '').replace(/\*/, 'splat')
    }
    return list;
  };

  var buildParams = function(paramNames, match) {
    var params = {};
    for (var i=0; i<paramNames.length; i++) {
      params[paramNames[i]] = match[i]
    }
    return params;
  };

  var isHrefLocal = function(href) {
    return href.match(new RegExp('^'+document.location.origin))
  };

  var stripOrigin = function(href) {
    return href.replace(document.location.origin, '');
  };

  var globalMethod = function(scope, methodName) {
    window[methodName] = function() {
      return scope[methodName].apply(scope, arguments);
    }
  };

  // Context constructor
  
  module.Context = function(handler, match) {
    this.params = (handler.paramNames.length===0) ? {} : buildParams(handler.paramNames, match);
    this.match = match;
  };

  module.Context.prototype.content = function(txt) {
    document.getElementById('content').innerHTML = txt;
  };

  // App

  module.App = function(options) {
    this.routes = [];
    this.root = options && options.root ? '/' + stripSlashes(options.root) + '/' : '/';
    this.mode = options && options.mode 
      && options.mode === 'history' 
      && !!(history.pushState) ? 'history' : 'hash';
  };

  module.App.prototype.get = function(re, handler) {
    var path, paramNames;
    if (typeof re === 'function') {
      handler = re; re = '';
    }
    if (re instanceof RegExp) {
      path = false; paramNames = [];
    } else {
      path = re;
      paramNames = buildParamNames(path);
      re = buildRegExp(path);
    }
    this.routes.push({ 
      re: re, path: path, paramNames: paramNames, handler: handler
    });
    return this;
  };

  module.App.prototype.currentPath = function() {
    var path = '';
    if (this.mode === 'history') {
      path = stripSlashes(decodeURI(location.pathname + location.search));
      path = path.replace(/\?(.*)$/, '');
      path = this.root !== '/' ? path.replace(this.root, '') : path;
    } else {
      var match = window.location.href.match(/#(.*)$/);
      path = match ? match[1] : '';
    }
    return stripSlashes(path);
  };

  module.App.prototype.handle = function(path) {
    path = stripSlashes(path!==undefined ? path : this.currentPath());
    for(var i=0; i<this.routes.length; i++) {
      var params = {};
      var match = path.match(this.routes[i].re);
      if (match) {
        match.shift();
        var ctx = new module.Context(this.routes[i], match);
        return this.routes[i].handler.apply(ctx, match);
      }           
    }
  };

  module.App.prototype.navigate = function(path) {
    path = path ? path : '';
    if (this.mode === 'history') {
      history.pushState(null, null, this.root + stripSlashes(path));
    } else {        
      window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + path;
    }
    this.handle();
    return this;
  };

  module.App.prototype.run = function() {
    var self = this;
    if (this.mode==='history') {
      document.addEventListener('click', function(e) {
        if (e.target.href && isHrefLocal(e.target.href)) {
          e.preventDefault();
          self.navigate(stripOrigin(e.target.href));
        }
      });
    }
    this.handle();
    return this;
  };

  module.takesTheStage = function() {
    window.app = new module.App({mode: 'history'});
    globalMethod(window.app, 'get');
    globalMethod(window.app, 'navigate');
    globalMethod(window.app, 'run');
  };

  return module;

})();

