const fs = require('fs');
const fse = require('fs-extra');
const color = require('colors/safe');
const path = require('path');
const pug = require('pug');
const featurebook = require('@jkroepke/featurebook-api');
const markdown = require('@jkroepke/featurebook-markdown');

const helper = require('./helper');

const TEMPLATES_DIR = path.join(__dirname, '..', 'resources');

const NO_SUMMARY_MESSAGE_MD = 'You can put some content here by creating the `SUMMARY.md` Markdown file.';

const getMarkdownOptions = (pathPrefix) => ({
  imageRenderer: helper.getImageRenderer(pathPrefix),
  linkRenderer: helper.getLinkRenderer(pathPrefix),
});

const html = async (specDir, outputDir) => {
  const metadata = await featurebook.readMetadata(specDir) || {};
  const specTree = await featurebook.readSpecTree(specDir);

  const assetsDir = path.join(specDir, 'assets');
  const localTemplatesDir = path.join(specDir, 'templates');

  const indexTemplate = fs.existsSync(path.join(localTemplatesDir, 'index.pug'))
    ? path.join(localTemplatesDir, 'index.pug')
    : path.join(TEMPLATES_DIR, 'index.pug');

  const featureTemplate = fs.existsSync(path.join(localTemplatesDir, 'feature.pug'))
    ? path.join(localTemplatesDir, 'feature.pug')
    : path.join(TEMPLATES_DIR, 'feature.pug');

  fs.mkdirSync(outputDir, { recursive: true });

  try {
    const stats = await fs.promises.stat(assetsDir);
    if (stats.isDirectory()) {
      await fse.copy(assetsDir, path.join(outputDir, 'assets'))
        .catch((e) => { console.error(e); });
    }
  } catch (err) {
    // ignore
  }

  const indexTemplateCompiled = pug.compileFile(indexTemplate, { debug: false, pretty: true });
  const featureTemplateCompiled = pug.compileFile(featureTemplate, { debug: false, pretty: true });

  const print = async (node, pathPrefix) => {
    if (node.type === 'file') {
      const featurePath = path.join(specDir, node.path);
      const nextPathPrefix = pathPrefix || './';
      try {
        const feature = await featurebook.readFeature(featurePath);

        const renderedFeature = markdown.descriptionMarkdownToHTML(
          feature.feature,
          getMarkdownOptions(nextPathPrefix),
        );

        const renderedTemplate = featureTemplateCompiled({
          pathPrefix: nextPathPrefix,
          path: node.path,
          metadata,
          specTree,
          feature: renderedFeature,
        });

        await fs.promises.writeFile(path.join(outputDir, `${node.path}.html`), renderedTemplate)
          .catch((e) => { console.log(e); });
      } catch (err) {
        console.warn(color.red('Error printing feature `%s`: %s'), featurePath, err);
      }
    } else if (node.type === 'directory') {
      fs.mkdirSync(path.join(outputDir, node.path), { recursive: true });

      const summary = await featurebook.readSummary(
        path.join(specDir, node.path),
      ) || NO_SUMMARY_MESSAGE_MD;

      const summaryOutputPath = path.join(outputDir, node.path, 'index.html');
      const nextPathPrefix = pathPrefix ? `${pathPrefix}../` : './';

      const renderedMarkdown = markdown.render(summary, getMarkdownOptions(nextPathPrefix));

      const renderedTemplate = indexTemplateCompiled({
        pathPrefix: nextPathPrefix,
        metadata,
        specTree,
        summary: renderedMarkdown,
      });

      await fs.promises.writeFile(summaryOutputPath, renderedTemplate)
        .catch((e) => { console.log(e); });

      node.children.forEach((child) => {
        print(child, nextPathPrefix);
      });
    }
  };

  await print(specTree);
};

module.exports = html;
html.$imageRenderer = helper.getImageRenderer('');
html.$linkRenderer = helper.getLinkRenderer('');
