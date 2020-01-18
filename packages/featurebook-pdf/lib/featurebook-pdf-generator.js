const color = require('colors/safe');
const fs = require('fs');
const path = require('path');
const api = require('@jkroepke/featurebook-api');
const PDFDocument = require('pdfkit');
const commonmark = require('commonmark');
const CommonmarkPDFRenderer = require('pdfkit-commonmark').default;
const PdfTable = require('voilab-pdf-table');

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

    this.commonmarkReader = new commonmark.Parser();
    this.commonmarkPdfWriter = new CommonmarkPDFRenderer();
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
      const features = await api.readFeatures(path.join(this.specDir, node.path));

      for (const feature of features) {
        this.doc.moveDown()
          .fontSize(fontSize.xLarge)
          .fillColor('red')
          .text(`${feature.feature.keyword}:`, { continued: true })
          .fillColor('black')
          .text(` ${feature.feature.name}`);

        if (feature.feature.description) {
          this.doc.fontSize(fontSize.inherit)
            .fillColor('gray');

          this.printMarkdown(feature.feature.description);
        }

        for (const children of feature.feature.children) {
          if (children.background) {
            this.printBackground(children.background);
          } else if (children.scenario) {
            // eslint-disable-next-line no-await-in-loop
            await this.printScenarioDefinition(children.scenario);
          }
        }
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

  printTable(tableHeader, tableBody) {
    const { x } = this.doc;

    this.doc.x += 40;

    const width = tableHeader.cells.map((value, index) => Math.max(
      value.value.length,
      ...tableBody.map((tableRow) => tableRow.cells[index].value.length),
    ));

    const pdfTable = new PdfTable(this.doc);

    pdfTable.setColumnsDefaults({
      align: 'left',
    });

    for (const [i, header] of tableHeader.cells.entries()) {
      pdfTable
        .addColumns([{
          id: header.value.toLowerCase(),
          header: header.value,
          width: Math.max(width[i], 5) * 7,
        }]);
    }

    const body = tableBody.map((bodyRow) => (
      bodyRow.cells.reduce((result, value, index) => (
        { ...result, [tableHeader.cells[index].value.toLowerCase()]: value.value }
      ), {})
    ));

    pdfTable.addBody(body).onPageAdded((tb) => {
      tb.addHeader();
    });

    // https://github.com/voilab/voilab-pdf-table/issues/21#issuecomment-533665007
    this.doc.x = x;
  }

  printStep(step) {
    this.doc.fontSize(fontSize.inherit)
      .fillColor('red')
      .text(step.keyword, { continued: true })
      .fillColor('black')
      .text(step.text);

    if (step.docString) {
      this.doc.fillColor('green')
        .text(step.docString.content);
    }

    if (step.dataTable) {
      const tableHeader = step.dataTable.rows.shift();
      const tableBody = step.dataTable.rows;

      this.printTable(tableHeader, tableBody);
    }
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
    this.commonmarkPdfWriter.render(this.doc, this.commonmarkReader.parse(text));
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

    for (const step of background.steps) {
      this.printStep(step);
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

    this.printTable(example.tableHeader, example.tableBody);
  }
}

module.exports = FeaturebookPdfGenerator;
