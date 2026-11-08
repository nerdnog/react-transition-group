const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const lib = path.join(root, 'lib');

const writeJson = (file, data) =>
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);

const pkg = JSON.parse(
  fs.readFileSync(path.join(root, 'package.json'), 'utf8')
);

// One folder per top-level module (lib/Transition/package.json and so on), so
// `require('@nerdnog/react-transition-group/Transition')` keeps working. This
// replaces cherry-pick, whose file search doesn't work on Windows paths.
fs.readdirSync(path.join(root, 'src'))
  .filter((name) => name.endsWith('.js') && name !== 'index.js')
  .map((name) => name.replace(/\.js$/, ''))
  .forEach((name) => {
    fs.mkdirSync(path.join(lib, name), { recursive: true });
    writeJson(path.join(lib, name, 'package.json'), {
      name: `${pkg.name}/${name}`,
      private: true,
      main: `../cjs/${name}.js`,
      module: `../esm/${name}.js`,
    });
  });

const libPkg = { ...pkg, main: 'cjs/index.js', module: 'esm/index.js' };
delete libPkg.scripts;
delete libPkg.devDependencies;
delete libPkg.jest;
writeJson(path.join(lib, 'package.json'), libPkg);

['README.md', 'LICENSE'].forEach((file) => {
  fs.copyFileSync(path.join(root, file), path.join(lib, file));
});
