
const { EOL } = require('os');

const chai = require('chai');

const { expect } = chai;

const featurebook = require('./../../lib/featurebook-api');

describe('featurebook-api', () => {
  describe('#getVersion', () => {
    it('should return version of this API', () => {
      expect(featurebook.getVersion()).to.equal(require('./../../package.json').version);
    });
  });

  describe('#readSpecTree', () => {
    it('should propagate specification tree object', (done) => {
      featurebook.readSpecTree('test/resources/specs/tiny', (err, specTree) => {
        expect(err).to.be.null;
        expectTinySpecTree(specTree);
        done();
      });
    });
  });


  describe('#readMetadata', () => {
    it('should propagate null given a specification directory without the metadata descriptor', (done) => {
      featurebook.readMetadata('test/resources/features', (err, metadata) => {
        expect(err).to.be.null;
        expect(metadata).to.be.null;
        done();
      });
    });

    it('should propagate the metadata object given a specification directory with the metadata descriptor', (done) => {
      featurebook.readMetadata('test/resources/specs/tiny', (err, metadata) => {
        expect(metadata).to.deep.equal({ title: 'Tiny Specification', version: 'v1.0.3' });
        done();
      });
    });
  });

  describe('#readFeature', () => {
    it('should propagate an error given a non-existent feature file', (done) => {
      featurebook.readFeature('__nonexistentfeaturefile__', (err) => {
        expect(err).to.exist;
        done();
      });
    });

    it('should propagate an error given an unparsable feature file', (done) => {
      featurebook.readFeature('test/resources/features/unparsable.feature', (err) => {
        expect(err).to.exist;
        done();
      });
    });

    it('should propagate the feature object given a valid feature file', (done) => {
      featurebook.readFeature('test/resources/features/simple.feature', (err, document) => {
        expect(err).to.not.exist;
        expectSampleFeature(document.feature);
        done();
      });
    });
  });


  describe('#readSummary', () => {
    it('should propagate null given a directory without the summary file', (done) => {
      featurebook.readSummary('__nonexistentsummaryfile_', (err, summary) => {
        expect(err).to.be.null;
        expect(summary).to.be.null;
        done();
      });
    });

    it('should propagate contents given a directory with the summary file', (done) => {
      featurebook.readSummary('test/resources/specs/tiny', (err, summary) => {
        expect(err).to.be.null;
        expect(summary).to.equal(`# Tiny Specification${EOL}`);
        done();
      });
    });
  });

  function expectSampleFeature(feature) {
    expect(feature.type).to.equal('Feature');
    expect(feature.name).to.equal('Simple feature');
    expect(feature.keyword).to.equal('Feature');

    expect(feature.children).to.have.nested.property('[0].type', 'Scenario');
    expect(feature.children).to.have.nested.property('[0].name', 'Simple scenario');
    expect(feature.children).to.have.nested.property('[0].keyword', 'Scenario');

    expect(feature.children).to.have.nested.property('[0].steps[0].type', 'Step');
    expect(feature.children).to.have.nested.property('[0].steps[0].keyword', 'Given ');
    expect(feature.children).to.have.nested.property('[0].steps[0].text', 'step 1');

    expect(feature.children).to.have.nested.property('[0].steps[1].type', 'Step');
    expect(feature.children).to.have.nested.property('[0].steps[1].keyword', 'When ');
    expect(feature.children).to.have.nested.property('[0].steps[1].text', 'step 2');

    expect(feature.children).to.have.nested.property('[0].steps[2].type', 'Step');
    expect(feature.children).to.have.nested.property('[0].steps[2].keyword', 'Then ');
    expect(feature.children).to.have.nested.property('[0].steps[2].text', 'step 3');
  }

  function expectTinySpecTree(specTree) {
    expect(specTree).to.deep.equal({
      path: '.',
      name: 'tiny',
      displayName: 'Tiny',
      type: 'directory',
      children: [
        {
          path: 'section-a',
          name: 'section-a',
          displayName: 'Section-a',
          type: 'directory',
          children: [
            {
              path: 'section-a/file-a.feature',
              name: 'file-a.feature',
              displayName: 'File-a',
              type: 'file',
            },
            {
              path: 'section-a/file-b.feature',
              name: 'file-b.feature',
              displayName: 'File-b',
              type: 'file',
            },
            {
              path: 'section-a/section-b',
              name: 'section-b',
              displayName: 'Section-b',
              type: 'directory',
              children: [
                {
                  path: 'section-a/section-b/file-c.feature',
                  name: 'file-c.feature',
                  displayName: 'Feature C Overwrite',
                  type: 'file',
                },
              ],
            },
          ],
        },
        {
          path: 'section-c',
          name: 'section-c',
          displayName: 'Section-c',
          type: 'directory',
          children: [
            {
              path: 'section-c/file-d.feature',
              name: 'file-d.feature',
              displayName: 'Feature D Overwrite',
              type: 'file',
            },
          ],
        },
        {
          displayName: 'Unparsable',
          name: 'unparsable.feature',
          path: 'unparsable.feature',
          type: 'file',
        },
      ],
    });
  }
});
