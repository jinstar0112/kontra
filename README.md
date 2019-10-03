[![GitHub version](https://badge.fury.io/gh/straker%2Fkontra.svg)](https://badge.fury.io/gh/straker%2Fkontra)
[![Build Status](https://travis-ci.org/straker/kontra.svg?branch=master)](https://travis-ci.org/straker/kontra)
[![Coverage Status](https://coveralls.io/repos/straker/kontra/badge.svg?branch=master&service=github)](https://coveralls.io/github/straker/kontra?branch=master)

# Kontra.js

A lightweight JavaScript gaming micro-library, optimized for js13kGames.

## Documentation

All the documentation can be found on the [github page](https://straker.github.io/kontra/).

## Supporting

Kontra.js is made possible by users like you. Through helping find issues, opening pull requests, and [funding continuous development](https://www.patreon.com/straker), Kontra.js can continue to provide you with quality improvements and updates.

When you become a Patron, you get access to behind the scenes development logs, the ability to vote on which features to work on next, and early access to development builds. 

## Contributing

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

### Building

To build the development code, run `npm run build`. To build the distribution version of the code, run `npm run dist`. Both should be built before submitting a pull request.

### Testing

Please add unit and/or integration tests for all new changes. To run the tests, run `npm test`.

### Docs

The documentation is built from the JSDoc comments in the source files using [LivingCSS](https://github.com/straker/livingcss) (I know, not what it was intended for but it makes it really easy to build multiple pages of docs. And it's highly configurable). To update the docs just modify the JSDoc comments.

The docs are built along with the development version of the code, so running `npm run build` will build the docs as well. This ensures they stay in sync with any changes to the code.

All doc related gulp tasks and `@tag` information can be found in the `doc-tasks.js` file.