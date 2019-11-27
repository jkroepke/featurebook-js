const gherkin = require('gherkin');

const getParsedGherkin = (featureFile, options) => new Promise((resolve, reject) => {
  const stream = gherkin.fromPaths([featureFile], options);
  const data = [];

  stream.on('error', (e) => {
    console.log(e);
    reject(e);
  });

  stream.on('data', (chunk) => {
    console.log(chunk);
    if (Object.prototype.hasOwnProperty.call(chunk, 'source')) {
      data.push({ source: chunk.source, name: null, pickles: [] });
    } else if (Object.prototype.hasOwnProperty.call(chunk, 'gherkinDocument')) {
      data[data.length - 1].name = chunk.gherkinDocument.feature.name;
    } else {
      data[data.length - 1].pickles.push(chunk.pickle);
    }
  });

  stream.on('end', () => {
    resolve(data);
  });
});

const parse = async (featureFile) => {
  const options = {
    includeSource: false,
    includeGherkinDocument: false,
    includePickles: false,
  };

  return getParsedGherkin(featureFile, options);
};

module.exports = {
  parse,
};
