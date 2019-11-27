const path = require('path');
const featurebookPdf = require('@jkroepke/featurebook-pdf');

exports.command = 'pdf [spec-dir]';
exports.desc = 'build the specification PDF document';

exports.builder = (yargs) => yargs.options({
  o: {
    description: 'directory where the PDF specification will be generated (defaults to ./dist/pdf)',
    alias: 'output-dir',
    default: path.join(process.cwd(), 'dist', 'pdf'),
  },
});

exports.handler = async (argv) => {
  const outputDir = argv.o;
  const { specDir } = argv;
  featurebookPdf(specDir || process.cwd(), outputDir);
};
