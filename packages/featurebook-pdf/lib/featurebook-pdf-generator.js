const color = require('colors/safe');
const fs = require('fs');
const path = require('path');
const api = require('@jkroepke/featurebook-api');
const PDFDocument = require('pdfkit');

const fontSize = {
  xxLarge: 18,
  xLarge: 16,
  larger: 14,
  inherit: 12,
  smaller: 10,
  xSmall: 8,
  xxSmall: 6,
};

class FeaturebookPdfGenerator {
  constructor(specDir) {
    this.doc = new PDFDocument();
    this.specDir = specDir;
  }

  end() {
    this.doc.end();
  }

  setMetadata(metadata) {
    this.doc.info.Title = metadata.title ? metadata.title : 'Untitled';
    if (Object.prototype.hasOwnProperty.call(metadata, 'authors')) {
      this.doc.info.Author = metadata.authors.map((author) => `${author.firstName} ${author.lastName}`).join(', ');
    }

    this.printTitle(metadata);
    this.printAuthors(metadata);
    this.printContributors(metadata);
  }

  setOutput(file) {
    this.doc.pipe(fs.createWriteStream(file));
  }

  setFont(file) {
    this.doc.font(file);
  }

  async printNode(node) {
    if (node.type === 'file') {
      await this.printFeature(node);
    }
    if (node.type === 'directory') {
      await this.printDirectory(node);
      for (const child of node.children) {
        // eslint-disable-next-line no-await-in-loop
        await this.printNode(child);
      }
    }
  }

  async printFeature(node) {
    try {
      const feature = await api.readFeature(path.join(this.specDir, node.path));

      this.doc.moveDown()
        .fontSize(fontSize.xLarge)
        .fillColor('red')
        .text(`${feature.keyword}:`, { continued: true })
        .fillColor('black')
        .text(` ${feature.name}`);

      if (feature.description) {
        this.doc.fontSize(fontSize.inherit)
          .fillColor('gray');

        this.printMarkdown(feature.description);
      }

      this.printBackground(feature.background);

      for (const scenario of feature.scenarioDefinitions) {
        // eslint-disable-next-line no-await-in-loop
        await this.printScenarioDefinition(scenario);
      }
    } catch (err) {
      console.warn(color.red('Error printing feature `%s`: %s'), node.path, err);
    }
  }

  async printScenarioDefinition(scenario) {
    this.doc.moveDown()
      .fontSize(fontSize.larger)
      .fillColor('red')
      .text(`${scenario.keyword}:`, { continued: true })
      .fillColor('black')
      .text(` ${scenario.name}`);

    if (scenario.description) {
      this.doc.fontSize(fontSize.inherit)
        .fillColor('gray');
      this.printMarkdown(scenario.description);
    }

    this.doc.moveDown(0.5);

    for (const step of scenario.steps) {
      // eslint-disable-next-line no-await-in-loop
      await this.printStep(step);
    }
    for (const example of scenario.examples) {
      // eslint-disable-next-line no-await-in-loop
      await this.printExample(example);
    }
  }

  printDocStringArgument(step) {
    if (step.argument && step.argument.type === 'DocString') {
      this.doc.fillColor('green')
        .text(step.argument.content);
    }
  }

  printTableRow(tableHeader) {
    this.doc.fontSize(fontSize.inherit)
      .fillColor('blue')
      .text(`| ${tableHeader.cells.map((cell) => cell.value).join(' | ')} |`);
  }

  printTableHeader(tableHeader) {
    this.printTableRow(tableHeader);
  }

  printTableData(tableData) {
    tableData.forEach(this.printTableRow);
  }

  printDataTableArgument(step) {
    if (step.argument && step.argument.type === 'DataTable') {
      this.printTableData(step.argument.rows);
    }
  }

  printStep(step) {
    this.doc.fontSize(fontSize.inherit)
      .fillColor('red')
      .text(step.keyword, { continued: true })
      .fillColor('black')
      .text(step.text);
    this.printDocStringArgument(step);
    this.printDataTableArgument(step);
  }

  printTitle(metadata) {
    this.doc.fontSize(32)
      .text(`${metadata.title} ${metadata.version || ''}`);
  }

  printAuthors(metadata) {
    if (Object.prototype.hasOwnProperty.call(metadata, 'authors')) {
      this.doc.fontSize(fontSize.larger)
        .text(metadata.authors.map((author) => `${author.firstName} ${author.lastName}`));
    }
  }

  printContributors(metadata) {
    if (Object.prototype.hasOwnProperty.call(metadata, 'contributors')) {
      this.doc.fontSize(fontSize.larger)
        .text(metadata.contributors.map((contributor) => `${contributor.firstName} ${contributor.lastName}`));
    }
  }

  printMarkdown(text) {
    // TODO Actually parse the markdown text and print it.
    this.doc.text(text);
  }

  async printDirectory(node) {
    this.doc.addPage()
      .fontSize(fontSize.xxLarge)
      .fillColor('black')
      .text(node.displayName, { underline: true });

    const summary = await api.readSummary(path.join(this.specDir, node.path));
    if (summary) {
      this.doc.moveDown(0.5);
      this.doc.fontSize(fontSize.inherit)
        .fillColor('gray');
      this.printMarkdown(summary);
    }
  }

  printBackground(background) {
    if (background) {
      this.doc.moveDown()
        .fontSize(fontSize.larger)
        .fillColor('red')
        .text(`${background.keyword}:`, { continued: true })
        .fillColor('black')
        .text(` ${background.name}`);

      if (background.description) {
        this.doc.fontSize(fontSize.inherit)
          .fillColor('gray');
        this.printMarkdown(background.description);
      }

      background.steps.forEach(this.printStep);
    }
  }

  printExample(example) {
    this.doc.moveDown(0.5);
    this.doc.fontSize(fontSize.larger)
      .fillColor('red')
      .text(`${example.keyword}:`, { continued: true })
      .fillColor('black')
      .text(` ${example.name}`);

    if (example.description) {
      this.doc.fontSize(fontSize.inherit)
        .fillColor('gray');
      this.printMarkdown(example.description);
    }

    this.printTableHeader(example.tableHeader);
    this.printTableData(example.tableBody);
  }
}

module.exports = FeaturebookPdfGenerator;
