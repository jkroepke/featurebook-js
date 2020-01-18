#!/usr/bin/env node

const featurebook = require('@jkroepke/featurebook-api');
const { version } = require('../package.json');

// eslint-disable-next-line no-unused-expressions
require('yargs')
  .commandDir('../cmds')
  .demandCommand()
  .help()
  .version('v', 'version', `CLI version: ${version}\nAPI version: ${featurebook.getVersion()}`) // the version string.
  .alias('version', 'v')
  .argv;
