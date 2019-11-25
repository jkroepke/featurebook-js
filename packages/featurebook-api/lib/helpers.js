const fsPromises = require('fs').promises;
const path = require('path');

// https://gist.github.com/kethinov/6658166#gistcomment-3079220
const findInDir = async (startDir, filter) => {
  const search = async (file) => {
    const node = {
      path: path.normalize(path.relative(startDir, file)).replace(/\\/g, '/'),
      name: path.basename(file),
    };

    const stats = await fsPromises.stat(file);

    if (stats.isDirectory()) {
      node.type = 'directory';
      node.children = [];

      try {
        const files = await fsPromises.readdir(file);

        const results = [];

        for (const f of files) {
          if (filter(path.relative(startDir, path.join(file, f)))) {
            results.push(
              search(path.join(file, f))
                .then((ret) => { node.children.push(ret); }),
            );
          }
        }

        await Promise.all(results);

        node.children.sort((a, b) => a.name.localeCompare(b.name));
      } catch (e) {
        console.err(e);
      }
    } else if (stats.isFile()) {
      node.type = 'file';
    }

    return node;
  };

  return search(startDir);
};

const getDisplayName = (fileName) => {
  const withoutUnderscores = fileName.replace(/_/g, ' ');
  const uppercase = withoutUnderscores.charAt(0).toUpperCase() + withoutUnderscores.slice(1);
  return uppercase.replace(/\.feature/, '');
};

module.exports = {
  findInDir,
  getDisplayName,
};
