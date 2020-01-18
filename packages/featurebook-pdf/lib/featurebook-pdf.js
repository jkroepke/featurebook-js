const fs = require('fs');
const path = require('path');
const api = require('@jkroepke/featurebook-api');
const FeaturebookPdfGenerator = require('./featurebook-pdf-generator');

const pdf = async (specDir, outputDir) => {
  const outputFile = path.join(outputDir, 'specification.pdf');
  const metadata = await api.readMetadata(specDir) || {};

  fs.mkdirSync(outputDir, { recursive: true });

  const doc = new FeaturebookPdfGenerator(specDir);

  doc.setMetadata(metadata);
  doc.setOutput(outputFile);
  doc.setFont(path.join(__dirname, '..', 'resources/fonts', 'Anaheim-Regular.ttf'));

  const specTree = await api.readSpecTree(specDir);

  await doc.printNode(specTree);

  doc.end();
};

module.exports = pdf;
