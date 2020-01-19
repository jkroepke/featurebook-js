const color = require('colors/safe');
const fs = require('fs');
const path = require('path');
const api = require('@jkroepke/featurebook-api');
const PdfPrinter = require('pdfmake');
const markdown2pdfmake = require('markdown2pdfmake');

class FeaturebookPdfGenerator {
  constructor(specDir, fonts) {
    this.specDir = specDir;
    this.printer = new PdfPrinter(fonts);
  }

  setDocumentDefinition(styles = {}) {
    this.docDefinition = {
      defaultStyle: {
        font: 'Anaheim',
        fontSize: 12,
      },
      pageSize: 'A4',
      info: {},
      styles: {
        header1: { fontSize: 24, bold: true, marginBottom: 5 },
        header2: { fontSize: 20, bold: true, marginBottom: 5 },
        header3: { fontSize: 18, bold: true, marginBottom: 5 },
        ...styles,
      },
      content: [],
      footer: [
        {
          table: {
            widths: [500],
            headerRows: 1,
            body: [[{ text: '', border: [false, true, false, false] }]],
          },
          layout: {
            hLineWidth: () => 1,
          },
          margin: [40, 10, 0, 0],
        },
        {
          text: (new Date()).toLocaleDateString(),
          margin: [40, 0, 40, 0],
          style: 'smallText',
        },
        {
          text: '',
          margin: [0, 5, 40, 0],
          alignment: 'right',
          style: 'smallText',
          bold: true,
        },
      ],
    };
  }

  setMetadata(metadata) {
    this.docDefinition.info.Title = metadata.title ? metadata.title : 'Untitled';
    this.docDefinition.footer[2].text = metadata.title ? metadata.title : 'Untitled';

    if (Object.prototype.hasOwnProperty.call(metadata, 'authors')) {
      this.docDefinition.info.Author = metadata.authors.map(FeaturebookPdfGenerator.formatName).join(', ');
    }

    this.printTitle(metadata);

    if (Object.prototype.hasOwnProperty.call(metadata, 'authors')) {
      this.printHumans(metadata.authors);
    }

    if (Object.prototype.hasOwnProperty.call(metadata, 'contributors')) {
      this.printHumans(metadata.contributors);
    }
  }

  generate(file) {
    const pdfDoc = this.printer.createPdfKitDocument(this.docDefinition);
    pdfDoc.pipe(fs.createWriteStream(file));
    pdfDoc.end();
  }

  printIndex() {
    this.docDefinition.content.push({
      toc: {
        title: { text: 'Table of content', style: 'header2' },
        numberStyle: { bold: true },
      },
    });
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
        this.docDefinition.content.push({
          text: [
            { text: `${feature.feature.keyword.trim()}:`, color: 'red', fontSize: 16 },
            { text: ` ${feature.feature.name}`, fontSize: 16 },
          ],
          margin: [0, 10, 0, 5],
        });

        if (feature.feature.description) {
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
    this.docDefinition.content.push({
      text: [
        { text: `${scenario.keyword.trim()}:`, color: 'red', fontSize: 14 },
        { text: ` ${scenario.name}`, fontSize: 14 },
      ],
      margin: [0, 10, 0, 5],
    });

    if (scenario.description) {
      this.printMarkdown(scenario.description);
    }

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
    const body = [
      tableHeader.cells.map((cell) => cell.value),
      ...tableBody.map((bodyRow) => (
        bodyRow.cells.map((cell) => cell.value)
      )),
    ].filter(Boolean);

    this.docDefinition.content.push(
      {
        margin: [0, 10],
        table: {
          dontBreakRows: false,
          keepWithHeaderRows: 1,
          headerRows: 1,
          widths: Array(tableHeader.cells.length).fill('auto'),
          body,
        },
      },
    );
  }

  printStep(step) {
    this.docDefinition.content.push({
      text: [
        { text: `${step.keyword.trim()}:`, color: 'red' },
        { text: ` ${step.text}` },
      ],
    });

    if (step.docString) {
      this.docDefinition.content.push({
        text: step.docString.content, color: 'green',
      });
    }

    if (step.dataTable) {
      const tableHeader = step.dataTable.rows.shift();
      const tableBody = step.dataTable.rows;

      this.printTable(tableHeader, tableBody);
    }
  }

  printTitle(metadata) {
    this.docDefinition.content.push({
      text: `${metadata.title} ${metadata.version || ''}`,
      style: 'header1',
    });
  }

  printHumans(humans) {
    this.docDefinition.content.push({
      text: humans.map((name) => `${name.firstName} ${name.lastName}`).join(', '),
    });
  }

  printMarkdown(markdown, options = {}) {
    const markdownImage = /(!\[.+]\([^)]+\))/g;

    const parts = markdown
      .split(markdownImage).map((e) => e.trim()).filter(Boolean);

    for (const markdownPart of parts) {
      const body = markdownPart.match(markdownImage)
        ? [[{
          image: markdownPart
            .replace(/!\[.+]\(([^)]+)\)/, '$1')
            .replace('asset://', path.join(process.cwd(), this.specDir, '/')),
          maxWidth: 505,
        }]]
        : markdown2pdfmake(markdownPart).map((paragraph) => ([{ ...paragraph, ...options }]));

      this.docDefinition.content.push({
        table: {
          headerRows: 0,
          widths: ['*'],
          body: [...body],
        },
        layout: {
          defaultBorder: false,
          fillColor: '#ddd',
        },
      });
    }
  }

  async printDirectory(node) {
    const nodePath = node.path.split('/');
    const headerLevel = nodePath.length;

    this.docDefinition.content.push({
      text: node.displayName,
      style: `header${headerLevel}`,
      margin: [0, 20, 0, 10],
      pageBreak: 'before',
      tocItem: true,
      tocStyle: headerLevel === 1 ? { fontSize: 14 } : { fontSize: 12 },
      tocMargin: headerLevel === 1 ? [0, 10, 0, 0] : 0,
    });

    const summary = await api.readSummary(path.join(this.specDir, node.path));
    if (summary) {
      this.printMarkdown(summary);
    }
  }

  printBackground(background) {
    this.docDefinition.content.push({
      text: [
        { text: `${background.keyword.trim()}:`, color: 'red', fontSize: 14 },
        { text: ` ${background.name}`, fontSize: 14 },
      ],
      margin: [0, 10, 0, 5],
    });

    if (background.description) {
      this.printMarkdown(background.description);
    }

    for (const step of background.steps) {
      this.printStep(step);
    }
  }

  printExample(example) {
    this.docDefinition.content.push({
      text: [
        { text: `${example.keyword.trim()}:`, color: 'red', fontSize: 14 },
        { text: ` ${example.name}`, fontSize: 14 },
      ],
      margin: [0, 10, 0, 5],
    });

    if (example.description) {
      this.printMarkdown(example.description);
    }

    this.printTable(example.tableHeader, example.tableBody);
  }
}

module.exports = FeaturebookPdfGenerator;
