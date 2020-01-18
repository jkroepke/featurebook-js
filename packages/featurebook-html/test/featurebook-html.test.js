
const chai = require('chai');
const featurebookHtml = require('../lib/featurebook-html');

chai.should();

describe('featurebook-html', () => {
  describe('$imageRenderer', () => {
    let imageRenderer;

    beforeEach(() => {
      imageRenderer = featurebookHtml.$imageRenderer;
    });

    it('should not modify the src attribute given any URL', () => {
      imageRenderer({ src: 'http://somehost.com/images/smiley.gif' })
        .should.deep.equal({ src: 'http://somehost.com/images/smiley.gif' });

      imageRenderer({ src: 'https://somehost.com/images/smiley.gif' })
        .should.deep.equal({ src: 'https://somehost.com/images/smiley.gif' });

      imageRenderer({ src: 'images/smiley.gif' })
        .should.deep.equal({ src: 'images/smiley.gif' });
    });

    it('should remove the schema prefix given a URL with the assert:// schema', () => {
      imageRenderer({ src: 'asset://assets/images/smiley.gif' })
        .should.deep.equal({ src: 'assets/images/smiley.gif' });
    });
  });

  describe('$linkRenderer', () => {
    let linkRenderer;

    beforeEach(() => {
      linkRenderer = featurebookHtml.$linkRenderer;
    });

    it('should not modify the href attribute given any URL', () => {
      linkRenderer({ href: 'http://somehost.com/index.html' })
        .should.deep.equal({ href: 'http://somehost.com/index.html' });

      linkRenderer({ href: 'some/path/index.html' })
        .should.deep.equal({ href: 'some/path/index.html' });

      linkRenderer({ href: '/some/path/index.html' })
        .should.deep.equal({ href: '/some/path/index.html' });
    });

    it('should remove the schema prefix and add the .html suffix given a URL with the feature:// schema', () => {
      linkRenderer({ href: 'feature://some/path/foo.feature' })
        .should.deep.equal({ href: 'some/path/foo.feature.html' });
    });
  });
});
