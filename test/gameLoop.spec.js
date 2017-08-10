// --------------------------------------------------
// kontra.gameloop
// --------------------------------------------------
describe('kontra.gameLoop', function() {
  var loop;

  afterEach(function() {
    loop && loop.stop();
  });

  // --------------------------------------------------
  // kontra.gameLoop.init
  // --------------------------------------------------
  describe('init', function() {

    it('should log an error if not passed required functions', function() {
      expect(kontra.gameLoop).to.throw();
    });

  });





  // --------------------------------------------------
  // kontra.gameLoop.stop
  // --------------------------------------------------
  describe('stop', function() {
    it('should call cancelAnimationFrame', function() {
      sinon.stub(window, 'cancelAnimationFrame', kontra._noop);

      loop = kontra.gameLoop({
        update: kontra._noop,
        render: kontra._noop,
        clearCanvas: false
      });

      loop.stop();

      expect(window.cancelAnimationFrame.called).to.be.ok;

      window.cancelAnimationFrame.restore();
    });

  });





  // --------------------------------------------------
  // kontra.gameLoop.frame
  // --------------------------------------------------
  describe('frame', function() {

    it('should call the update function and pass it dt', function(done) {
      loop = kontra.gameLoop({
        update: sinon.spy(),
        render: kontra._noop,
        clearCanvas: false
      });

      loop.start();

      setTimeout(function() {
        expect(loop.update.called).to.be.ok;
        expect(loop.update.getCall(0).args[0]).to.equal(1/60);
        done();
      }, 250);
    });

    it('should call the render function', function(done) {
      loop = kontra.gameLoop({
        update: kontra._noop,
        render: sinon.spy(),
        clearCanvas: false
      });

      loop.start();

      setTimeout(function() {
        expect(loop.render.called).to.be.ok;
        done();
      }, 250);
    });

    it('should exit early if time elapsed is greater than 1000ms', function() {
      var count = 0;

      loop = kontra.gameLoop({
        update: function(time) { count++; },
        render: kontra._noop,
        clearCanvas: false
      });

      loop._last = performance.now() - 1500;
      loop._frame();

      expect(count).to.equal(0);
    });

    it('should make multiple calls to the update function if enough time has elapsed', function() {
      var count = 0;

      loop = kontra.gameLoop({
        update: function(time) { count++; },
        render: kontra._noop,
        clearCanvas: false
      });

      loop._last = performance.now() - (1E3/60) * 2;
      loop._frame();

      expect(count).to.equal(2);
    });

  });

});