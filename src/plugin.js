(function() {

  /**
   * Get the kontra object method name from the plugin.
   * @private
   *
   * @param {string} methodName - Before/After function name
   *
   * @returns {string}
   */
  function getMethod(methodName) {
    let methodTitle = methodName.substr( methodName.search(/[A-Z]/) );
    return methodTitle[0].toLowerCase() + methodTitle.substr(1);
  }

  /**
   * Remove an interceptor.
   * @private
   *
   * @param {function[]} interceptors - Before/After interceptor list
   * @param {function} fn - Interceptor function
   */
  function removeInterceptor(interceptors, fn) {
    let index = interceptors.indexOf(fn);
    if (index !== -1) {
      interceptors.splice(index, 1);
    }
  }

  /**
   * Object for registering plugins
   */
  kontra.plugin = {

    /**
     * Register a plugin to run before or after methods.
     * @memberof kontra.plugin
     *
     * @param {string} object - Kontra object to override
     * @param {object} plugin - Plugin object
     *
     * @example
     * kontra.plugin.register('sprite', myPluginObject)
     */
    register(object, plugin) {
      const kontraObjectProto = kontra[object].prototype || kontra[object];

      // create interceptor list and functions
      if (!kontraObjectProto._inc) {
        kontraObjectProto._inc = {};
        kontraObjectProto._bInc = function beforePlugins(context, method, ...args) {
          this._inc[method].before.forEach(fn => {
            fn(context, ...args);
          });
        };
        kontraObjectProto._aInc = function afterPlugins(context, method, result, ...args) {
          return this._inc[method].after.reduce((acc, fn) => {
            let newResult = fn(context, acc, ...args);
            return newResult ? newResult : acc;
          }, result);
        };
      }

      // add plugin to interceptors
      Object.getOwnPropertyNames(plugin).forEach(methodName => {
        let method = getMethod(methodName);

        if (!kontraObjectProto[method]) return;

        // override original method
        if (!kontraObjectProto['_o' + method]) {
          kontraObjectProto['_o' + method] = kontraObjectProto[method];

          kontraObjectProto[method] = function interceptedFn(...args) {

            // call before interceptors
            this._bInc(this, method, ...args);

            let result = kontraObjectProto['_o' + method].call(this, ...args);

            // call after interceptors
            return this._aInc(this, method, result, ...args);
          };
        }

        // create interceptors for the method
        if (!kontraObjectProto._inc[method]) {
          kontraObjectProto._inc[method] = {
            before: [],
            after: []
          };
        }

        if (methodName.startsWith('before')) {
          kontraObjectProto._inc[method].before.push(plugin[methodName]);
        }
        else if (methodName.startsWith('after')) {
          kontraObjectProto._inc[method].after.push(plugin[methodName]);
        }
      });
    },

    /**
     * Unregister a plugin
     * @memberof kontra.plugin
     *
     * @param {string} object - Kontra object to override
     * @param {object} plugin - Plugin object
     *
     * @example
     * kontra.plugin.unregister('sprite', myPluginObject)
     */
    unregister(object, plugin) {
      const kontraObjectProto = kontra[object].prototype || kontra[object];

      if (!kontraObjectProto._inc) return;

      // remove plugin from interceptors
      Object.getOwnPropertyNames(plugin).forEach(methodName => {
        let method = getMethod(methodName);

        if (methodName.startsWith('before')) {
          removeInterceptor(kontraObjectProto._inc[method].before, plugin[methodName]);
        }
        else if (methodName.startsWith('after')) {
          removeInterceptor(kontraObjectProto._inc[method].after, plugin[methodName]);
        }
      });
    }
  };
})();