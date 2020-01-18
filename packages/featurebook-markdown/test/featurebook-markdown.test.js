const chai = require('chai');
const markdown = require('../lib/featurebook-markdown');

chai.should();

describe('featurebook-markdown', () => {
  describe('#render', () => {
    it('should parse emphasized text', () => {
      markdown.render('I am __emphasized__.')
        .should.equal('<p>I am <strong>emphasized</strong>.</p>\n');
    });

    it('should parse an inline-style link to another feature', () => {
      markdown.render('[amazing feature](feature://amazing.feature)')
        .should.equal('<p><a href="feature://amazing.feature">amazing feature</a></p>\n');
    });

    it('should parse an inline-style link to another feature with a custom linkRenderer', () => {
      function linkRenderer(attrs) {
        return { ...attrs, href: `___${attrs.href}` };
      }

      markdown.render('[amazing feature](feature://amazing.feature)', { linkRenderer })
        .should.equal('<p><a href="___feature://amazing.feature">amazing feature</a></p>\n');
    });

    it('should parse an inline-style image relative to the assets directory', () => {
      markdown.render('![Hello World](asset://assets/images/hello_world.png)')
        .should.equal('<p><img src="asset://assets/images/hello_world.png" alt="Hello World"></p>\n');
    });

    it('should parse an inline-style image relative to the assets directory with a custom imageRenderer', () => {
      function imageRenderer(attrs) {
        return { ...attrs, src: `___${attrs.src}` };
      }
      markdown.render('![Hello World](asset://assets/images/hello_world.png)', { imageRenderer })
        .should.equal('<p><img src="___asset://assets/images/hello_world.png" alt="Hello World"></p>\n');
    });
  });
});
