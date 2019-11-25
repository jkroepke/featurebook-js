const markdown = require('@jkroepke/featurebook-markdown');

const imageRenderer = (attrs) => {
  const addAssetPrefix = (url) => `api/rest/raw${url.startsWith('/') ? '' : '/'}${url.substring(markdown.ASSET_URL_SCHEMA.length)}`;

  let { src } = attrs;

  if (src.startsWith(markdown.ASSET_URL_SCHEMA)) {
    src = addAssetPrefix(src);
  }

  return {
    ...attrs,
    src,
  };
};

const linkRenderer = (attrs) => {
  const addFeaturePrefix = (url) => `/#/viewer${url.startsWith('/') ? '' : '/'}${url.substring(markdown.FEATURE_URL_SCHEMA.length)}`;

  let { href } = attrs;

  if (href.startsWith(markdown.FEATURE_URL_SCHEMA)) {
    href = addFeaturePrefix(href);
  }

  return {
    ...attrs,
    href,
  };
};

module.exports = {
  linkRenderer,
  imageRenderer,
};
