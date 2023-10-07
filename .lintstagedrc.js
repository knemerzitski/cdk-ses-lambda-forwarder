const path = require('path');

const buildEslintCommand = (filenames) =>
  `eslint --fix --cache ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' ')}`;

module.exports = {
  '*.{js,jsx,ts,tsx}': [buildEslintCommand],
  '**/*': ['prettier --write --ignore-unknown'],
};
