var kontra = (function(kontra, undefined) {
  'use strict';

  /**
   * A quadtree for 2D collision checking. The quadtree acts like an object pool in that it
   * will create subnodes as objects are needed but it won't clean up the subnodes when it
   * collapses to avoid garbage collection.
   * @memberof kontra
   *
   * @see kontra.quadtree.prototype.init for list of parameters.
   *
   * The quadrant indices are numbered as follows (following a z-order curve):
   *     |
   *  0  |  1
   * ----+----
   *  2  |  3
   *     |
   */
  kontra.quadtree = function(properties) {
    var quadtree = Object.create(kontra.quadtree.prototype);
    quadtree.init(properties);

    return quadtree;
  };

  kontra.quadtree.prototype = {
    /**
     * Initialize properties on the quadtree.
     * @memberof kontra.quadtree
     *
     * @param {object} properties - Properties of the quadtree.
     * @param {number} [properties.depth=0] - Current node depth.
     * @param {number} [properties.maxDepth=3] - Maximum node depths the quadtree can have.
     * @param {number} [properties.maxObjects=25] - Maximum number of objects a node can support before splitting.
     * @param {object} [properties.parentNode] - The node that contains this node.
     * @param {object} [properties.bounds] - The 2D space this node occupies.
     */
    init: function init(properties) {
      properties = properties || {};

      this.depth = properties.depth || 0;
      this.maxDepth = properties.maxDepth || 3;
      this.maxObjects = properties.maxObjects || 25;

      // since we won't clean up any subnodes, we need to keep track of which nodes are
      // currently the leaf node so we know which nodes to add objects to
      this.isBranchNode = false;

      this.parentNode = properties.parentNode;

      this.bounds = properties.bounds || {
        x: 0,
        y: 0,
        width: kontra.game.width,
        height: kontra.game.height
      };

      this.objects = [];
      this.subnodes = [];
    },

    /**
     * Clear the quadtree
     * @memberof kontra.quadtree
     */
    clear: function clear() {
      if (this.isBranchNode) {
        for (var i = 0; i < 4; i++) {
          this.subnodes[i].clear();
        }
      }

      this.isBranchNode = false;
      this.objects.length = 0;
    },

    /**
     * Find the leaf node the object belongs to and get all objects that are part of
     * that node.
     * @memberof kontra.quadtree
     *
     * @param {object} object - Object to use for finding the leaf node.
     *
     * @returns {object[]} A list of objects in the same leaf node as the object.
     */
    get: function get(object) {
      var node = this;
      var objects = [];
      var indices, index;

      // traverse the tree until we get to a leaf node
      while (node.subnodes.length && this.isBranchNode) {
        indices = this._getIndex(object);

        for (var i = 0, length = indices.length; i < length; i++) {
          index = indices[i];

          objects.push.apply(objects, this.subnodes[index].get(object));
        }

        return objects;
      }

      return node.objects;
    },

    /**
     * Add an object to the quadtree. Once the number of objects in the node exceeds
     * the maximum number of objects allowed, it will split and move all objects to their
     * corresponding subnodes.
     * @memberof kontra.quadtree
     *
     * @param {...object|object[]} Objects to add to the quadtree
     *
     * @example
     * kontra.quadtree().add({id:1}, {id:2}, {id:3});
     * kontra.quadtree().add([{id:1}, {id:2}], {id:3});
     */
    add: function add() {
      var i, object, obj, indices, index;

      for (var j = 0, length = arguments.length; j < length; j++) {
        object = arguments[j];

        // add a group of objects separately
        if (Array.isArray(object)) {
          this.add.apply(this, object);

          continue;
        }

        // current node has subnodes, so we need to add this object into a subnode
        if (this.subnodes.length && this.isBranchNode) {
          this._addToSubnode(object);

          continue;
        }

        // this node is a leaf node so add the object to it
        this.objects.push(object);

        // split the node if there are too many objects
        if (this.objects.length > this.maxObjects && this.depth < this.maxDepth) {
          this._split();

          // move all objects to their corresponding subnodes
          for (i = 0; obj = this.objects[i]; i++) {
            this._addToSubnode(obj);
          }

          this.objects.length = 0;
        }
      }
    },

    /**
     * Add an object to a subnode.
     * @memberof kontra.quadtree
     * @private
     *
     * @param {object} object - Object to add into a subnode
     */
    _addToSubnode: function _addToSubnode(object) {
      var indices = this._getIndex(object);

      // add the object to all subnodes it intersects
      for (var i = 0, length = indices.length; i < length; i++) {
        this.subnodes[ indices[i] ].add(object);
      }
    },

    /**
     * Determine which subnodes the object intersects with.
     * @memberof kontra.quadtree
     * @private
     *
     * @param {object} object - Object to check.
     *
     * @returns {number[]} List of all subnodes object intersects.
     */
    _getIndex: function getIndex(object) {
      var indices = [];

      var verticalMidpoint = this.bounds.x + this.bounds.width / 2;
      var horizontalMidpoint = this.bounds.y + this.bounds.height / 2;

      // save off quadrant checks for reuse
      var intersectsTopQuadrants = object.y < horizontalMidpoint && object.y + object.height >= this.bounds.y;
      var intersectsBottomQuadrants = object.y + object.height >= horizontalMidpoint && object.y < this.bounds.y + this.bounds.height;

      // object intersects with the left quadrants
      if (object.x < verticalMidpoint && object.x + object.width >= this.bounds.x) {
        if (intersectsTopQuadrants) {  // top left
          indices.push(0);
        }

        if (intersectsBottomQuadrants) {  // bottom left
          indices.push(2);
        }
      }

      // object intersects with the right quadrants
      if (object.x + object.width >= verticalMidpoint && object.x < this.bounds.x + this.bounds.width) {  // top right
        if (intersectsTopQuadrants) {
          indices.push(1);
        }

        if (intersectsBottomQuadrants) {  // bottom right
          indices.push(3);
        }
      }

      return indices;
    },

    /**
     * Split the node into four subnodes.
     * @memberof kontra.quadtree
     * @private
     */
    _split: function split() {
      this.isBranchNode = true;

      // only split if we haven't split before
      if (this.subnodes.length) {
        return;
      }

      var subWidth = this.bounds.width / 2 | 0;
      var subHeight = this.bounds.height / 2 | 0;

      for (var i = 0; i < 4; i++) {
        this.subnodes[i] = kontra.quadtree({
          bounds: {
            x: this.bounds.x + (i % 2 === 1 ? subWidth : 0),  // nodes 1 and 3
            y: this.bounds.y + (i >= 2 ? subHeight : 0),      // nodes 2 and 3
            width: subWidth,
            height: subHeight
          },
          depth: this.depth+1,
          maxDepth: this.maxDepth,
          maxObjects: this.maxObjects,
          parentNode: this
        });
      }
    },

    /**
     * Draw the quadtree. Useful for visual debugging.
     * @memberof kontra.quadtree
     */
    render: function() {
      /* istanbul ignore next */
      // don't draw empty leaf nodes, always draw branch nodes and the first node
      if (this.objects.length || this.depth === 0 ||
          (this.parentNode && this.parentNode.isBranchNode)) {

        kontra.context.strokeStyle = 'red';
        kontra.context.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);

        if (this.subnodes.length) {
          for (var i = 0; i < 4; i++) {
            this.subnodes[i].render();
          }
        }
      }
    }
  };

  return kontra;
})(kontra || {});