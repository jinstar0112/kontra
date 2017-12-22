var argv = require('yargs').argv;
var colors = require('colors');
var gulp = require('gulp');
var concat = require('gulp-concat-util');
var connect = require('gulp-connect');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var size = require('gulp-size');
var uglify = require('gulp-uglify');
var changed = require('gulp-changed');
var plumber = require('gulp-plumber');
var preprocess = require('gulp-preprocess');

var Server = require('karma').Server;

var package = require('./package.json');


// Enables/Disables visual debugging in Kontra
var VISUAL_DEBUG = false;

// Enables/Disables DEBUG mode in Kontra
var DEBUG = false;

// gulp.task('lint', function() {
//   return gulp.src('src/*.js')
//     .pipe(jshint())
//     .pipe(jshint.reporter( 'jshint-stylish' ))
// });

gulp.task('scripts', function() {
  return gulp.src(['src/core.js', 'src/*.js'])
    .pipe(concat('kontra.js'))
    .pipe(gulp.dest('.'))
    .pipe(gulp.dest('./docs/js'))
    .pipe(preprocess({context: { DEBUG: DEBUG, VISUAL_DEBUG:VISUAL_DEBUG}}))
    .pipe(plumber())
    .pipe(uglify())
    .pipe(plumber.stop())
    .pipe(rename('kontra.min.js'))
    .pipe(size({
      showFiles: true
    }))
    .pipe(size({
      showFiles: true,
      gzip: true
    }))
    .pipe(gulp.dest('.'))
    .pipe(connect.reload());
});

gulp.task('dist', function() {
  return gulp.src('src/*.js')
    .pipe(preprocess({context: { DEBUG: DEBUG, VISUAL_DEBUG: VISUAL_DEBUG}}))
    .pipe(changed('./dist'))
    .pipe(plumber())
    .pipe(uglify())
    .pipe(plumber.stop())
    .pipe(size({
      showFiles: true
    }))
    .pipe(size({
      showFiles: true,
      gzip: true
    }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('build', function() {
  // output files that can be built
  if (!argv.files) {
    var files = [
      '       assets - Load images, audio, and data assets',
      '     gameLoop - Update and render the game',
      '     keyboard - Keyboard input handler',
      '         pool - Object pool for object reuse',
      '     quadtree - 2D spatial partition for storing objects by their positions',
      '       sprite - Object for drawing rectangles, images, and sprite sheet animations',
      '  spriteSheet - Sprite sheets and sprite animations',
      '   tileEngine - Tile engine for rendering tilesets',
      '        store - Local Storage interface for ease of use'
    ];

    console.log('\n================================='.blue);
    console.log('    Custom Build of Kontra.js'.blue);
    console.log('================================='.blue);
    console.log('\nUse'.white, '--files'.cyan, 'to select which modules to build:'.white);
    // console.log('(modules shown in parentheses are a dependency of the module and will be automatically installed)\n')

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
  for (var i = 0; i < src.length; i++) {
    src[i] = 'src/' + src[i] + '.js';
  }

  // create header for unminified build
  var date = new Date().toISOString().slice(0,10);
  var header = [
    '/*',
    ' * Kontra.js v' + package.version + ' (Custom Build on ' + date + ') | MIT',
    ' * Build: --files ' + originalSrc,
    ' */\n'
  ];

  return gulp.src(src)
    .pipe(concat('kontra.build.js'))
    .pipe(preprocess({context: { DEBUG: DEBUG, VISUAL_DEBUG:VISUAL_DEBUG}}))
    .pipe(concat.header(header.join('\n') + '\n'))
    .pipe(size())
    .pipe(gulp.dest('.'))
    .pipe(uglify())
    .pipe(concat.header(header.join('\n')))
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
  gulp.watch('src/*.js', ['dist', 'scripts']);
});

gulp.task('test', function(done) {
  new Server({
    basePath: '',
    frameworks: ['mocha', 'chai', 'sinon'],
    files: [
      // assets
      'test/phantom.polyfill.js',
      'src/*.js',
      'test/*.js'
    ],
    browsers: ['Chrome', 'Firefox', 'Safari', 'IE']
  }, done).start();
});

gulp.task('default', ['scripts', 'connect', 'watch']);
