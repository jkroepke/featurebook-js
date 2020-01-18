const path = require('path');
const featurebookHtml = require('@jkroepke/featurebook-html');

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
  const outputDir = argv.o;
  const { specDir } = argv;
  await featurebookHtml(specDir || process.cwd(), outputDir);
};
