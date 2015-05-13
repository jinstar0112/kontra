var gulp = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat-util');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var size = require('gulp-size');
var connect = require('gulp-connect');
var sourcemaps = require('gulp-sourcemaps');

var package = require('./package.json');
var argv = require('yargs').argv;
var colors = require('colors');

function swallowError(error) {
  // print error so we know that uglify task didn't complete
  console.log(error.toString());

  this.emit('end');
}

gulp.task('lint', function() {
  return gulp.src('src/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter( 'jshint-stylish' ))
});

gulp.task('scripts', function() {
  return gulp.src(['node_modules/kontra-asset-loader/kontraAssetLoader.js', 'src/core.js', 'src/*.js'])
    .pipe(sourcemaps.init())
      .pipe(concat('kontra.js'))
      .pipe(size())
      .pipe(gulp.dest('.'))
      .pipe(uglify())
      .on('error', swallowError)  // prevent uglify task from crashing watch on error
      .pipe(rename('kontra.min.js'))
      .pipe(size())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('.'))
    .pipe(connect.reload());
});

gulp.task('build', function() {
  // output files that can be built
  if (!argv.files) {
    var files = [
      '     assets - Load images, audio, and data assets',
      '   gameLoop - Update and render the game',
      '   keyboard - Keyboard input handler',
      '       pool - Object pool for object reuse',
      '   quadtree - 2D spatial partition for storing objects by their positions',
      '     sprite - Object for drawing rectangles, images, or sprite sheet animations',
      'spriteSheet - Sprite sheets and sprite animations',
      '      store - Local Storage wrapper to make it easier to work with'
    ];

    console.log('\n================================='.blue);
    console.log('    Custom Build of Kontra.js'.blue);
    console.log('================================='.blue);
    console.log('\nUse'.white, '--files'.cyan, 'to select which modules to build:\n'.white);

    // output the file name in a different color
    for (var i = 0, file; file = files[i]; i++) {
      var parts = file.split('-');

      console.log(parts[0].blue, '-', parts[1]);
    }
    console.log('\nExample:'.white, '--files gameLoop,keyboard,sprite,pool\n'.cyan);
    return;
  }

  var originalSrc = argv.files;
  var src = originalSrc.split(',');

  // always add the core file to the front
  src.unshift('core');

  // normalize files to include full path and extension
  for (var i = 0, length = src.length; i < length; i++) {
    src[i] = 'src/' + src[i] + '.js';
  }

  // create header for unminified build
  var date = new Date().toISOString().slice(0,10);
  var header = [
    '/*',
    ' * Kontra.js v' + package.version + ' (Custom Build on ' + date + ') | MIT',
    ' * Build: --files ' + originalSrc,
    ' */\n\n'
  ]

  return gulp.src(src)
    .pipe(concat('kontra.build.js'))
    .pipe(concat.header(header.join('\n')))
    .pipe(size())
    .pipe(gulp.dest('.'))
    .pipe(uglify())
    .pipe(rename('kontra.build.min.js'))
    .pipe(size())
    .pipe(gulp.dest('.'))
});

gulp.task('connect', function() {
  connect.server({
    livereload: true
  });
});

gulp.task('watch', function() {
  gulp.watch('src/*.js', ['lint', 'scripts']);
});

gulp.task('default', ['lint', 'scripts', 'connect', 'watch']);