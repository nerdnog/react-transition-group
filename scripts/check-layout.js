const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const fail = (lines) => {
  console.error(lines.join('\n'));
  process.exit(1);
};

const expected = fs
  .readFileSync(path.join(root, 'test/fixtures/4.4.5-files.txt'), 'utf8')
  .split('\n')
  .filter(Boolean);

const problems = [];

let pkg;
try {
  pkg = JSON.parse(
    fs.readFileSync(path.join(root, 'lib/package.json'), 'utf8')
  );
} catch (e) {
  fail([`lib/package.json is missing or unreadable: ${e.message}`]);
}

const wanted = {
  name: '@nerdnog/react-transition-group',
  main: 'cjs/index.js',
  module: 'esm/index.js',
};
Object.keys(wanted).forEach((key) => {
  if (pkg[key] !== wanted[key]) {
    problems.push(
      `lib/package.json ${key} is ${JSON.stringify(pkg[key])}, expected ${
        wanted[key]
      }`
    );
  }
});
['scripts', 'devDependencies'].forEach((key) => {
  if (key in pkg) problems.push(`lib/package.json must not have ${key}`);
});

const out = execSync('npm pack ./lib --dry-run --json', {
  cwd: root,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'ignore'],
});
const packed = JSON.parse(out)[0].files.map((f) => f.path);

expected.forEach((p) => {
  if (!packed.includes(p)) problems.push(`missing from package: ${p}`);
});

if (problems.length) fail(problems);

const extra = packed.filter((p) => !expected.includes(p)).length;
console.log(
  `layout ok: ${expected.length} of ${expected.length} 4.4.5 paths present, ${extra} new`
);
