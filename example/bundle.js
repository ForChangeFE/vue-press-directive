(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var VPress = (function () {
  'use strict';

  var INTERVAL = 600;
  var Handler = /** @class */ (function () {
      function Handler(uid, interval, callback) {
          this.uid = uid;
          this.interval = interval;
          this.startPoint = 0;
          this.endPoint = 0;
          this.callback = callback;
          this.start = this.start.bind(this);
          this.end = this.end.bind(this);
      }
      Handler.prototype.start = function () {
          this.startPoint = Date.now();
      };
      Handler.prototype.end = function () {
          this.endPoint = Date.now();
          var isValid = (this.endPoint - this.startPoint) > this.interval;
          if (isValid) {
              try {
                  this.callback();
              }
              catch (error) {
                  console.log(error);
              }
          }
      };
      return Handler;
  }());
  function createHandler(ctor, uid, interval, callback) {
      return new ctor(uid, interval, callback);
  }
  var VPress = {
      install: function (Vue, options) {
          if (options === void 0) { options = {}; }
          var interval = typeof options.interval === 'number' ? options.interval : INTERVAL;
          var handlers = {};
          var generateId = (function (id) { return function () { return '$' + id++; }; })(1);
          var addHandler = function (el, callback) {
              var uid = generateId();
              var handler = createHandler(Handler, uid, interval, callback);
              el.dataset.longPressId = uid;
              handlers[uid] = handler;
              return handler;
          };
          var removeHandler = function (el) {
              var uid = el.dataset.longPressId;
              if (uid) {
                  handlers[uid] = null;
                  delete handlers[uid];
              }
          };
          Vue.directive('press', {
              bind: function (el, binding) {
                  var callback = binding.value, arg = binding.arg;
                  var handler = addHandler(el, callback);
                  if (arg != null) {
                      var customInterval = parseInt(arg, 10);
                      if (!isNaN(customInterval)) {
                          handler.interval = customInterval;
                      }
                  }
                  el.style.userSelect = 'none';
                  el.style.webkitUserSelect = 'none';
                  el.addEventListener('contextmenu', function noSelect(event) {
                      event.preventDefault();
                  });
                  el.addEventListener('touchstart', handler.start);
                  el.addEventListener('touchend', handler.end);
                  el.addEventListener('touchcancel', handler.end);
              },
              unbind: function (el, binding) {
                  var uid = el.dataset.longPressId;
                  if (uid) {
                      var handler = handlers[uid];
                      el.removeEventListener('touchstart', handler.start);
                      el.removeEventListener('touchend', handler.end);
                      el.addEventListener('touchcancel', handler.end);
                      removeHandler(el);
                      handler = null;
                  }
              }
          });
      }
  };

  return VPress;

}());
