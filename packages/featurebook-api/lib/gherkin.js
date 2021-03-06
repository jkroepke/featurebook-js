const gherkin = require('gherkin').default;

const getParsedGherkin = (featureFile, options) => new Promise((resolve, reject) => {
  const stream = gherkin.fromPaths([featureFile], options);
  const data = [];

  stream.on('error', (e) => {
    console.error(e);
    reject(e);
  });

  stream.on('data', (chunk) => {
    if (Object.prototype.hasOwnProperty.call(chunk, 'source')) {
      data.push({ source: chunk.source, pickles: [] });
    } else if (Object.prototype.hasOwnProperty.call(chunk, 'gherkinDocument')) {
      data[data.length - 1] = {
        ...data[data.length - 1],
        ...chunk.gherkinDocument,
      };
    } else if (Object.prototype.hasOwnProperty.call(chunk, 'pickle')) {
      data[data.length - 1].pickles.push(chunk.pickle);
    } else {
      console.error('Unknown chunk');
      console.error(chunk);
    }
  });

  stream.on('end', () => {
    resolve(data);
  });
});

const parse = async (featureFile, options) => {
  const defaultOptions = {
    includeSource: true,
    includeGherkinDocument: true,
    includePickles: false,
  };

  return getParsedGherkin(featureFile, {
    ...defaultOptions,
    ...options,
  });
};

module.exports = {
  parse,
};
