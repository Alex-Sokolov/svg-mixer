const webpackVersion = require('webpack/package.json').version;

module.exports = class Replacer {
  /**
   * @param {string} input
   * @param {string} needle
   * @return {Array}
   */
  static getAllStringOccurrences(input, needle) {
    const indexes = [];
    let prevIndex = 0;

    // eslint-disable-next-line keyword-spacing,no-constant-condition
    while (true) {
      const startIndex = input.indexOf(needle, prevIndex);

      if (startIndex === -1) {
        break;
      }

      const endIndex = startIndex + needle.length;
      indexes.push([startIndex, endIndex]);
      prevIndex = endIndex;
    }

    return indexes;
  }

  /**
   * @param {NormalModule} module
   * @param {Compilation} compilation
   * @return {ReplaceSource}
   */
  static getModuleReplaceSource(module, compilation) {
    const args = [compilation.dependencyTemplates];

    if (webpackVersion[0] === '3') {
      args.push(compilation.outputOptions);
      args.push(compilation.requestShortener);
    }

    const cachedSource = module.source(...args);

    return typeof cachedSource.replace === 'function'
      ? cachedSource
      : cachedSource._source;
  }

  /**
   * @param {NormalModule} module
   * @param {Object<string, string>} replacements
   * @param {Compilation} compilation
   * @return {void}
   */
  static replaceInModuleSource(module, replacements, compilation) {
    const source = Replacer.getModuleReplaceSource(module, compilation);
    const originalSourceContent = module.originalSource().source();

    Object.keys(replacements).forEach(key => {
      const indexes = Replacer.getAllStringOccurrences(originalSourceContent, key);
      const replaceTo = replacements[key];

      indexes.forEach(idx => {
        const start = idx[0];
        const end = idx[1] - 1;

        const alreadyHasReplacement = source.replacements.find(r => (
          r[0] === start && r[1] === end && r[2] === replaceTo
        ));

        if (alreadyHasReplacement) {
          return;
        }

        source.replace(start, end, replaceTo);
      });
    });
  }
};
