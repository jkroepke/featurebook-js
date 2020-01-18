const md = require('markdown-it')({
  html: true,
  linkify: true,
});
const fromEntries = require('object.fromentries');

if (!Object.fromEntries) {
  fromEntries.shim();
}

const render = (text, markdownOptions) => {
  if (markdownOptions && markdownOptions.linkRenderer) {
    const defaultLinkRenderer = md.renderer.rules.link_open
      || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

    md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      const attrs = markdownOptions.linkRenderer({
        href: token.attrs[token.attrIndex('href')][1],
      });

      // FIXME Currently a custom image renderer can override only the href attribute.
      token.attrSet('href', attrs.href);
      return defaultLinkRenderer(tokens, idx, options, env, self);
    };
  }

  if (markdownOptions && markdownOptions.imageRenderer) {
    const defaultImageRenderer = md.renderer.rules.image
      || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

    md.renderer.rules.image = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      const attrs = markdownOptions.imageRenderer({
        src: token.attrs[token.attrIndex('src')][1],
      });

      // FIXME Currently a custom image renderer can override only the src attribute.
      token.attrSet('src', attrs.src);
      return defaultImageRenderer(tokens, idx, options, env, self);
    };
  }

  return md.render(text);
};

const descriptionMarkdownToHTML = async (features, options) => {
  const searchAndRender = (spec) => {
    const fn = (value, key) => {
      if (key === 'description') {
        return render(value, options);
      }

      if (typeof value === 'object') {
        return searchAndRender(value);
      }

      return value;
    };

    if (Array.isArray(spec)) {
      return spec.map(fn);
    }

    return Object.fromEntries(
      Object.entries(spec).map(
        ([k, v], i) => [k, fn(v, k, i)],
      ),
    );
  };

  return searchAndRender(features);
};

module.exports = {
  ASSET_URL_SCHEMA: 'asset://',
  FEATURE_URL_SCHEMA: 'feature://',

  descriptionMarkdownToHTML,

  render,
};
