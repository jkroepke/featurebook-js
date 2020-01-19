const fs = require('fs');
const path = require('path');
const api = require('@jkroepke/featurebook-api');
const FeaturebookPdfGenerator = require('./featurebook-pdf-generator');

const pdf = async (specDir, outputDir) => {
  const outputFile = path.join(outputDir, 'specification.pdf');
  const metadata = await api.readMetadata(specDir) || {};

  fs.mkdirSync(outputDir, { recursive: true });

  const fonts = {
    Anaheim: {
      normal: path.join(__dirname, '..', 'resources/fonts', 'Anaheim-Regular.ttf'),
      bold: path.join(__dirname, '..', 'resources/fonts', 'Anaheim-Regular.ttf'),
      italics: path.join(__dirname, '..', 'resources/fonts', 'Anaheim-Regular.ttf'),
      bolditalics: path.join(__dirname, '..', 'resources/fonts', 'Anaheim-Regular.ttf'),
    },
  };

  const doc = new FeaturebookPdfGenerator(specDir, fonts);
  doc.setDocumentDefinition({});
  doc.setMetadata(metadata);

  const specTree = await api.readSpecTree(specDir);

  doc.printIndex(specTree);

  await doc.printNode(specTree);

  doc.generate(outputFile);
};

module.exports = pdf;
