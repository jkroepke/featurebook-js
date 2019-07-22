const Gherkin = require('gherkin');
const parser = new Gherkin.Parser();

module.exports = {
  parse: function parse(text) {
    return parser.parse(text);
  }
};
