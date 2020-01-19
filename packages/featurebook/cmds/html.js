const path = require('path');

exports.command = 'html [spec-dir]';
exports.desc = 'build the specification HTML document';

exports.builder = (yargs) => yargs.options({
  o: {
    description: 'directory where the PDF specification will be generated (defaults to ./dist/pdf)',
    alias: 'output-dir',
    default: path.join(process.cwd(), 'dist'),
  },
})
  .positional('spec-dir', {
    describe: 'path to feature files',
    type: 'string',
    default: process.cwd(),
  });

exports.handler = async (argv) => {
  if (!require.resolve('@jkroepke/featurebook-html')) {
    console.error("Can't load module '@jkroepke/featurebook-html'. Did you run 'npm i -S @jkroepke/featurebook-html'?");
    process.exit(1);
  }

  // eslint-disable-next-line global-require
  const featurebookHtml = require('@jkroepke/featurebook-html');

  const outputDir = argv.o;
  const { specDir } = argv;
  await featurebookHtml(specDir || process.cwd(), outputDir);
};
