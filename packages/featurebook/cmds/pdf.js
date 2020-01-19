const path = require('path');

exports.command = 'pdf [spec-dir]';
exports.desc = 'build the specification PDF document';

exports.builder = (yargs) => yargs.options({
  o: {
    description: 'directory where the PDF specification will be generated (defaults to ./dist/pdf)',
    alias: 'output-dir',
    default: path.join(process.cwd(), 'dist', 'pdf'),
  },
})
  .positional('spec-dir', {
    describe: 'path to feature files',
    type: 'string',
    default: process.cwd(),
  });

exports.handler = async (argv) => {
  if (!require.resolve('@jkroepke/featurebook-pdf')) {
    console.error("Can't load module '@jkroepke/featurebook-pdf'. Did you run 'npm i -S @jkroepke/featurebook-pdf'?");
    process.exit(1);
  }

  // eslint-disable-next-line global-require
  const featurebookPdf = require('@jkroepke/featurebook-pdf');

  const outputDir = argv.o;
  const { specDir } = argv;
  await featurebookPdf(specDir || process.cwd(), outputDir);
};
