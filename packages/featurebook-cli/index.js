'use strict';

var COMMAND_NAMES = [];

var program = require('commander');

function main() {
  program.parse(process.argv);
  displayHelpIfNoCommandWasProvided();
}

function displayHelpIfNoCommandWasProvided() {
  var args = process.argv.slice(2);
  if (!args.length || COMMAND_NAMES.indexOf(args[0]) === -1) {
    program.help();
  }
}

module.exports = main;
