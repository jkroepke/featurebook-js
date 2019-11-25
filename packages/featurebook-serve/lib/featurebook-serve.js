const path = require('path');
const express = require('express');
const featurebook = require('@jkroepke/featurebook-api');
const markdown = require('@jkroepke/featurebook-markdown');

const { imageRenderer, linkRenderer } = require('./helper');

// --- REST API ---
// http://localhost:3000/api/rest/raw/assets/images/hello_world.png
// http://localhost:3000/api/rest/metadata
// http://localhost:3000/api/rest/summary
// http://localhost:3000/api/rest/spec/tree
// http://localhost:3000/api/rest/feature/hello_world.feature
// http://localhost:3000/api/rest/feature/non_technical%2Fload_testing.feature
// ----------------

const serve = async (specDir, port) => {
  const app = express();

  const markdownOptions = {
    imageRenderer,
    linkRenderer,
  };

  // serve static files from the `public` folder
  app.use('/', express.static(path.join(__dirname, '..', 'public')));

  // serve static raw files from the specification source dir directory
  app.use('/api/rest/raw', express.static(specDir, {
    index: false,
  }));

  app.get('/api/rest/metadata', async (req, res, next) => {
    try {
      const metadata = await featurebook.readMetadata(specDir);

      return res.send(metadata);
    } catch (error) {
      return next(error);
    }
  });

  // returns parsed summary or 404 if SUMMARY.md is not present
  app.get('/api/rest/summary/:path?', async (req, res, next) => {
    const summaryDir = req.params.path ? path.join(specDir, req.params.path) : specDir;
    try {
      const summary = await featurebook.readSummary(summaryDir);

      if (summary === null) {
        return res.status(404).end();
      }

      return res.send(markdown.render(summary, markdownOptions));
    } catch (error) {
      return next(error);
    }
  });

  app.get('/api/rest/spec/tree', async (req, res, next) => {
    try {
      const specTree = await featurebook.readSpecTree(specDir);
      return res.send(specTree);
    } catch (error) {
      return next(error);
    }
  });

  app.get('/api/rest/feature/:path', async (req, res) => {
    const responseBody = {};

    try {
      const feature = await featurebook.readFeature(path.join(specDir, req.params.path));

      responseBody.status = 'success';
      responseBody.data = await markdown.descriptionMarkdownToHTML(feature, markdownOptions);
    } catch (e) {
      responseBody.status = 'error';
      responseBody.message = `Unable to parse the feature file: ${e}`;
    } finally {
      res.send(responseBody);
    }
  });

  app.use((err, req, res, next) => {
    res.status(500).send({ error: err.message });
  });

  await app.listen(port);

  return app;
};

module.exports = serve;
serve.$imageRenderer = imageRenderer;
serve.$linkRenderer = linkRenderer;
