const md = require('markdown-it')({
  linkify: true,
});

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

const descriptionMarkdownToHTML = async (feature, options) => {
  const renderedFeature = feature;

  if (Object.prototype.hasOwnProperty.call(feature, 'description')) {
    renderedFeature.description = render(feature.description, options);
  }

  if (
    Object.prototype.hasOwnProperty.call(feature, 'background')
    && Object.prototype.hasOwnProperty.call(feature.background, 'description')
  ) {
    renderedFeature.background = {
      ...feature.background,
      description: render(feature.background.description, options),
    };
  }

  if (!Object.prototype.hasOwnProperty.call(feature, 'children')) {
    return renderedFeature;
  }

  for (const scenarioDefinition of feature.children) {
    if (scenarioDefinition.description) {
      scenarioDefinition.description = render(scenarioDefinition.description, options);
    }

    for (const example of scenarioDefinition.examples) {
      example.description = render(example.description, options);
    }
  }

  return renderedFeature;
};

module.exports = {
  ASSET_URL_SCHEMA: 'asset://',
  FEATURE_URL_SCHEMA: 'feature://',

  descriptionMarkdownToHTML,

  render,
};
