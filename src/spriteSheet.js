/*jshint -W084 */

var kontra = (function(kontra, undefined) {
  kontra.SpriteSheet = SpriteSheet;

  /**
   * Create a sprite sheet from an image.
   * @memberOf kontra
   * @constructor
   *
   * @param {object} options - Configure the sprite sheet.
   * @param {string|Image} options.image - Path to the image or Image object.
   * @param {number} options.frameWidth - Width (in px) of each frame.
   * @param {number} options.frameHeight - Height (in px) of each frame.
   */
  function SpriteSheet(options) {
    options = options || {};

    var _this = this;

    // load an image path
    if (kontra.isString(options.image)) {
      this.image = new Image();
      this.image.onload = calculateFrames;
      this.image.src = options.image;
    }
    // load an image object
    else if (kontra.isImage(options.image)) {
      this.image = options.image;
      calculateFrames();
    }
    else {
      var error = new SyntaxError('Invalid image.');
      kontra.log.error(error, 'You must provide an Image or path to an image.');
      return;
    }

    /**
     * Calculate the number of frames in a row.
     */
    function calculateFrames() {
      _this.frameWidth = options.frameWidth || _this.image.width;
      _this.frameHeight = options.frameHeight || _this.image.height;

      _this.framesPerRow = Math.floor(_this.image.width / _this.frameWidth);
    }
  }

  /**
   * Create an animation from the sprite sheet.
   * @memberOf kontra.SpriteSheet
   *
   * @param {object} animations - List of named animations to create from the Image.
   * @param {number|string|number[]|string[]} animations.animationName.frames - A single frame or list of frames for this animation.
   * @param {number} animations.animationName.frameSpeed=1 - Number of frames to wait before transitioning the animation to the next frame.
   *
   * @example
   * var animations = {
   *   idle: {
   *     frames: 1  // single frame animation
   *   },
   *   walk: {
   *     frames: '2..6',  // consecutive frame animation (frames 2-6, inclusive)
   *     frameSpeed: 4
   *   },
   *   moonWalk: {
   *     frames: '6..2',  // descending consecutive frame animation
   *     frameSpeed: 4
   *   },
   *   jump: {
   *     frames: [7, 12, 2],  // non-consecutive frame animation
   *     frameSpeed: 3
   *   },
   *   attack: {
   *     frames: ['8..10', 13, '10..8'],  // you can also mix and match, in this case frames [8,9,10,13,10,9,8]
   *     frameSpeed: 2
   *   }
   * };
   * sheet.createAnimation(animations);
   */
  SpriteSheet.prototype.createAnimation = function SpriteSheetCreateAnimation(animations) {
    var error;

    if (!animations || Object.keys(animations).length === 0) {
      error = new SyntaxError('No animations found.');
      kontra.log.error(error, 'You must provide at least one named animation to create an Animation.');
      return;
    }

    this.animations = {};

    // create each animation by parsing the frames
    var animation;
    var frames;
    for (var name in animations) {
      if (!animations.hasOwnProperty(name)) {
        continue;
      }

      animation = animations[name];
      frames = animation.frames;

      animation.frameSpeed = animation.frameSpeed || 1;

      // array that holds the order of the animation
      animation.animationSequence = [];

      if (frames === undefined) {
        error = new SyntaxError('No animation frames found.');
        kontra.log.error(error, 'Animation ' + name + ' must provide a frames property.');
        return;
      }

      // single frame
      if (kontra.isNumber(frames)) {
        animation.animationSequence.push(frames);
      }
      // consecutive frames
      else if (kontra.isString(frames)) {
        animation.animationSequence = parseConsecutiveFrames(frames);
      }
      // non-consecutive frames
      else if (kontra.isArray(frames)) {
        for (var i = 0, frame; frame = frames[i]; i++) {

          // consecutive frames
          if (kontra.isString(frame)) {
            var consecutiveFrames = parseConsecutiveFrames(frame);

            // add new frames to the end of the array
            animation.animationSequence.push.apply(animation.animationSequence,consecutiveFrames);
          }
          // single frame
          else {
            animation.animationSequence.push(frame);
          }
        }
      }

      this.animations[name] = new Animation(this, animation);
    }
  };

  /**
   * Get an animation by name.
   * @memberOf kontra.SpriteSheet
   *
   * @param {string} name - Name of the animation.
   *
   * @returns {Animation}
   */
  SpriteSheet.prototype.getAnimation = function SpriteSheetGetAnimation(name) {
    return this.animations[name];
  };

  /**
   * Parse a string of consecutive frames.
   * @private
   *
   * @param {string} frames - Start and end frame.
   *
   * @returns {number[]} List of frames.
   */
  function parseConsecutiveFrames(frames) {
    var animationSequence = [];
    var consecutiveFrames = frames.split('..');

    // turn each string into a number
    consecutiveFrames[0] = parseInt(consecutiveFrames[0], 10);
    consecutiveFrames[1] = parseInt(consecutiveFrames[1], 10);

    // determine which direction to loop
    var direction = (consecutiveFrames[0] < consecutiveFrames[1] ? 1 : -1);
    var i;

    // ascending frame order
    if (direction === 1) {
      for (i = consecutiveFrames[0]; i <= consecutiveFrames[1]; i++) {
        animationSequence.push(i);
      }
    }
    // descending order
    else {
      for (i = consecutiveFrames[0]; i >= consecutiveFrames[1]; i--) {
        animationSequence.push(i);
      }
    }

    return animationSequence;
  }

  /**
   * Single animation from a sprite sheet.
   * @private
   * @constructor
   *
   * @param {SpriteSheet} spriteSheet - Sprite sheet for the animation.
   * @param {object} animation - Animation object.
   * @param {number[]} animation.animationSequence - List of frames of the animation.
   * @param {number}  animation.frameSpeed - Number of frames to wait before transitioning the animation to the next frame.
   */
  function Animation(spriteSheet, animation) {

    this.animationSequence = animation.animationSequence;
    this.frameSpeed = animation.frameSpeed;

    var currentFrame = 0;  // the current frame to draw
    var counter = 0;       // keep track of frame rate
    var update;
    var draw;

    /**
     * Update the animation.
     * @memberOf Animation
     */
    this.update = function AnimationUpdate() {
      // update to the next frame if it is time
      if (counter === this.frameSpeed - 1) {
        currentFrame = ++currentFrame % this.animationSequence.length;
      }

      // update the counter
      counter = ++counter % this.frameSpeed;
    };

    /**
     * Draw the current frame.
     * @memberOf Animation
     *
     * @param {integer} x - X position to draw
     * @param {integer} y - Y position to draw
     */
    this.draw = function AnimationDraw(x, y) {
      // get the row and col of the frame
      var row = Math.floor(this.animationSequence[currentFrame] / spriteSheet.framesPerRow);
      var col = Math.floor(this.animationSequence[currentFrame] % spriteSheet.framesPerRow);

      ctx.drawImage(
        spriteSheet.image,
        col * spriteSheet.frameWidth, row * spriteSheet.frameHeight,
        spriteSheet.frameWidth, spriteSheet.frameHeight,
        x, y,
        spriteSheet.frameWidth, spriteSheet.frameHeight);
    };

    /**
     * Play the animation.
     * @memberOf Animation
     */
    this.play = function AnimationPlay() {
      // restore references to update and draw functions only if overridden
      if (update !== undefined) {
        this.update = update;
      }

      if (draw !== undefined) {
        this.draw = draw;
      }

      update = draw = undefined;
    };

    /**
     * Stop the animation and prevent update and draw.
     * @memberOf Animation
     */
    this.stop = function AnimationStop() {
      /**
       * Save references to update and draw functions
       *
       * Instead of putting an if statement in both draw/update functions that checks
       * a variable to determine whether to draw or update, we can just reassign the
       * functions to noop and save processing time in the game loop.
       * @see http://jsperf.com/boolean-check-vs-noop
       *
       * This creates more logic in the setup functions, but one time logic is better than
       * continuous logic.
       */

      // don't override if previously overridden
      if (update === undefined) {
        update = this.update;
        this.update = kontra.noop;
      }

      if (draw === undefined) {
        draw = this.draw;
        this.draw = kontra.noop;
      }
    };

    /**
     * Pause the animation and prevent update.
     * @memberOf Animation
     */
    this.pause = function AnimationPause() {
      // don't override if previously overridden
      if (update === undefined) {
        update = this.update;
        this.update = kontra.noop;
      }
    };

    /**
     * Go to a specific animation frame index.
     * @memberOf Animation
     *
     * @param {number} frame - Animation frame to go to.
     *
     * @example
     * sheet.createAnimation({
     *   run: { frames: [2,6,8,4,3] }
     * });
     * var run = sheet.getAnimation('run');
     * run.gotoFrame(2);  //=> animation will go to 8 (2nd index)
     * run.gotoFrame(0);  //=> animation will go to 2 (0th index)
     */
    this.gotoFrame = function AnimationGotoFrame(frame) {
      if (kontra.isNumber(frame) && frame >= 0 && frame < this.animationSequence.length) {
        currentFrame = frame;
        counter = 0;
      }
    };
  }

  return kontra;
})(kontra || {});