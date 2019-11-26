const os = require('os');
const dns = require('dns');
const color = require('colors/safe');
const opener = require('opener');
const featurebookServe = require('@jkroepke/featurebook-serve');

exports.command = 'serve [spec-dir]';
exports.desc = 'serve <spec-dir> as a system specification';

exports.builder = (yargs) => yargs.options({
  p: {
    description: 'port on which to listen to',
    alias: 'port',
    number: true,
    default: 3000,
  },
});

exports.handler = async (argv) => {
  const port = argv.p;
  const { specDir } = argv;

  await featurebookServe(specDir || process.cwd(), port);

  console.log(color.green(`FeatureBook is running on port ${port}`));

  const address = await dns.promises.resolve4(os.hostname());
  const shareLink = `http://${address}:${port}`;

  console.log(color.yellow(`It is available to all computers in the local network at ${shareLink}`));
//  opener(shareLink);
};
