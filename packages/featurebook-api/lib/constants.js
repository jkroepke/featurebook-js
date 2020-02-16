module.exports = {
  CUSTOM_TEMPLATE_DIR: 'templates',
  DEFAULT_FILE_ENCODING: 'UTF-8',
  DEFAULT_METADATA_FILE_NAME: 'featurebook.json',
  DEFAULT_SUMMARY_FILE_NAME: 'SUMMARY.md',
  DEFAULT_IGNORE_FILE_NAME: '.featurebookignore',
  DEFAULT_ASSETS_DIR: 'assets',
  DEFAULT_DIST_DIR: 'dist',
  GIT_REPO_DIR: '.git',
  GIT_IGNORE_FILE_NAME: '.gitignore',
};

module.exports.DEFAULT_IGNORE_PATTERNS = Object.values(module.exports);
