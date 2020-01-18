module.exports = {
  DEFAULT_FILE_ENCODING: 'UTF-8',
  DEFAULT_METADATA_FILE_NAME: 'featurebook.json',
  DEFAULT_SUMMARY_FILE_NAME: 'SUMMARY.md',
  DEFAULT_IGNORE_FILE_NAME: '.featurebookignore',
  DEFAULT_ASSETS_DIR: 'assets',
  DEFAULT_DIST_DIR: 'dist',
  GIT_REPO_DIR: '.git',
  GIT_IGNORE_FILE_NAME: '.gitignore',
};

module.exports.DEFAULT_IGNORE_PATTERNS = [
  module.exports.DEFAULT_METADATA_FILE_NAME,
  module.exports.DEFAULT_SUMMARY_FILE_NAME,
  module.exports.DEFAULT_IGNORE_FILE_NAME,
  module.exports.DEFAULT_ASSETS_DIR,
  module.exports.DEFAULT_DIST_DIR,
  module.exports.GIT_REPO_DIR,
  module.exports.GIT_IGNORE_FILE_NAME,
];
