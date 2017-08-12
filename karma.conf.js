// Karma configuration
// Generated on Tue Apr 07 2015 23:14:35 GMT-0600 (MDT)

module.exports = function(config) {
  config.set({
    basePath: '',
    singleRun: false,
    autoWatch: true,
    concurrency: Infinity,
    frameworks: ['mocha', 'chai', 'sinon'],
    files: [
      // assets
      {pattern: 'test/imgs/*.*', included: false, served: true },
      {pattern: 'test/audio/*.*', included: false, served: true },
      {pattern: 'test/data/*.*', included: false, served: true },

      'src/core.js',
      'src/*.js',
      'test/*.js',
    ],
    browsers: ['ChromeHeadless'],
    proxies: {
      '/imgs': '/base/test/imgs',
      '/audio': '/base/test/audio',
      '/data': '/base/test/data'
    },
    reporters: ['progress', 'coverage'],
    preprocessors: {
      'src/*.js': ['coverage']
    },
    coverageReporter: {
      dir : 'coverage/',
      reporters: [
        {type: 'lcov', subdir: '.'},
        {type: 'text-summary'}
      ]
    }
  });
};
