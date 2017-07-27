var kontra = (function(kontra) {
  'use strict';

  /**
   * Object pool. The pool will grow in size to accommodate as many objects as are needed.
   * Unused items are at the front of the pool and in use items are at the of the pool.
   * @memberof kontra
   *
   * @param {object} properties - Properties of the pool.
   * @param {object} properties.create - Function that returns the object to use in the pool.
   * @param {object} properties.createProperties - Properties that will be passed to the create function.
   * @param {number} properties.maxSize - The maximum size that the pool will grow to.
   * @param {boolean} properties.fill - Fill the pool to max size instead of slowly growing.
   */
  kontra.pool = function(properties) {
    var pool = Object.create(kontra.pool.prototype);
    pool._init(properties);

    return pool;
  };

  kontra.pool.prototype = {
    /**
     * Initialize properties on the pool.
     * @memberof kontra.pool
     * @private
     *
     * @param {object} properties - Properties of the pool.
     * @param {object} properties.create - Function that returns the object to use in the pool.
     * @param {object} properties.createProperties - Properties that will be passed to the create function.
     * @param {number} properties.maxSize - The maximum size that the pool will grow to.
     * @param {boolean} properties.fill - Fill the pool to max size instead of slowly growing.
     *
     * Objects inside the pool must implement <code>render()</code>, <code>update()</code>,
     * <code>init()</code>, and <code>isAlive()</code> functions.
     */
    _init: function init(properties) {
      properties = properties || {};

      var error, obj;

      // check for the correct structure of the objects added to pools so we know that the
      // rest of the pool code will work without errors
      if (typeof properties.create !== 'function') {
        error = new SyntaxError('Required function not found.');
        kontra._logError(error, 'Parameter \'create\' must be a function that returns an object.');
        return;
      }

      // bind the create function to always use the create properties
      this.create = properties.create.bind(this, properties.createProperties || {});

      // ensure objects for the pool have required functions
      obj = this.create();

      if (!obj || typeof obj.render !== 'function' || typeof obj.update !== 'function' ||
          typeof obj.init !== 'function' || typeof obj.isAlive !== 'function') {
        error = new SyntaxError('Create object required functions not found.');
        kontra._logError(error, 'Objects to be pooled must implement render(), update(), init() and isAlive() functions.');
        return;
      }

      // start the pool with an object
      this.objects = [obj];
      this.size = 1;
      this.maxSize = properties.maxSize || Infinity;
      this.lastIndex = 0;
      this.inUse = 0;

      // fill the pool
      if (properties.fill) {
        if (properties.maxSize) {
          while (this.objects.length < this.maxSize) {
            this.objects.unshift(this.create());
          }

          this.size = this.maxSize;
          this.lastIndex = this.maxSize - 1;
        }
        else {
          error = new SyntaxError('Required property not found.');
          kontra._logError(error, 'Parameter \'maxSize\' must be set before you can fill a pool.');
          return;
        }
      }
    },

    /**
     * Get an object from the pool.
     * @memberof kontra.pool
     *
     * @param {object} properties - Properties to pass to object.init().
     */
    get: function get(properties) {
      properties = properties || {};

      // the pool is out of objects if the first object is in use and it can't grow
      if (this.objects[0].isAlive()) {
        if (this.size === this.maxSize) {
          return;
        }
        // double the size of the array by filling it with twice as many objects
        else {
          for (var x = 0; x < this.size && this.objects.length < this.maxSize; x++) {
            this.objects.unshift(this.create());
          }

          this.size = this.objects.length;
          this.lastIndex = this.size - 1;
        }
      }

      // save off first object in pool to reassign to last object after unshift
      var obj = this.objects[0];
      obj.init(properties);

      // unshift the array
      for (var i = 1; i < this.size; i++) {
        this.objects[i-1] = this.objects[i];
      }

      this.objects[this.lastIndex] = obj;
      this.inUse++;
    },

    /**
     * Return all objects that are alive from the pool.
     * @memberof kontra.pool
     *
     * @returns {object[]}
     */
    getAliveObjects: function getAliveObjects() {
      return this.objects.slice(this.objects.length - this.inUse);
    },

    /**
     * Clear the object pool.
     * @memberof kontra.pool
     */
    clear: function clear() {
      this.inUse = 0;
      this.size = 1;
      this.lastIndex = 0;
      this.objects.length = 0;
      this.objects.push(this.create());
    },

    /**
     * Update all alive pool objects.
     * @memberof kontra.pool
     *
     * @param {number} dt - Time since last update.
     */
    update: function update(dt) {
      var i = this.lastIndex;
      var obj;

      // If the user kills an object outside of the update cycle, the pool won't know of
      // the change until the next update and inUse won't be decremented. If the user then
      // gets an object when inUse is the same size as objects.length, inUse will increment
      // and this statement will evaluate to -1.
      //
      // I don't like having to go through the pool to kill an object as it forces you to
      // know which object came from which pool. Instead, we'll just prevent the index from
      // going below 0 and accept the fact that inUse may be out of sync for a frame.
      var index = Math.max(this.objects.length - this.inUse, 0);

      // only iterate over the objects that are alive
      while (i >= index) {
        obj = this.objects[i];

        obj.update(dt);

        // if the object is dead, move it to the front of the pool
        if (!obj.isAlive()) {

          // push an object from the middle of the pool to the front of the pool
          // without returning a new array through Array#splice to avoid garbage
          // collection of the old array
          // @see http://jsperf.com/object-pools-array-vs-loop
          for (var j = i; j > 0; j--) {
            this.objects[j] = this.objects[j-1];
          }

          this.objects[0] = obj;
          this.inUse--;
          index++;
        }
        else {
          i--;
        }
      }
    },

    /**
     * render all alive pool objects.
     * @memberof kontra.pool
     */
    render: function render() {
      var index = Math.max(this.objects.length - this.inUse, 0);

      for (var i = this.lastIndex; i >= index; i--) {
        this.objects[i].render();
      }
    }
  };

  return kontra;
})(kontra || {});