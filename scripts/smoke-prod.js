// Checks the built lib/ against React's production build (React 19).
process.env.NODE_ENV = 'production';

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  pretendToBeVisual: true,
});
const { window } = dom;
global.window = window;
global.document = window.document;
global.Node = window.Node;
global.Element = window.Element;
global.HTMLElement = window.HTMLElement;
global.requestAnimationFrame = window.requestAnimationFrame;
global.IS_REACT_ACT_ENVIRONMENT = false;

const React = require('react');
const { flushSync } = require('react-dom');
const { createRoot } = require('react-dom/client');
const { CSSTransition } = require('../lib/cjs');

const warnings = [];
console.warn = (...args) => warnings.push(args.join(' '));

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const render = (root, inProp, child) =>
  flushSync(() =>
    root.render(
      React.createElement(
        CSSTransition,
        { in: inProp, timeout: 10, classNames: 'fade' },
        child
      )
    )
  );

async function main() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const child = React.createElement('div', { id: 'box' });
  render(root, false, child);
  render(root, true, child);
  await wait(50);
  const box = document.getElementById('box');
  const className = box ? box.className : null;

  // The not-found path: a child that renders nothing.
  const container2 = document.createElement('div');
  document.body.appendChild(container2);
  const root2 = createRoot(container2);
  const Nothing = () => null;
  render(root2, false, React.createElement(Nothing));
  render(root2, true, React.createElement(Nothing));
  await wait(50);

  const minFile = path.join(
    __dirname,
    '../lib/dist/react-transition-group.min.js'
  );
  const minHasMessage = fs
    .readFileSync(minFile, 'utf8')
    .includes('Could not find the element');

  const problems = [];
  if (!className || !className.split(' ').includes('fade-enter-done')) {
    problems.push(
      `#box class is ${JSON.stringify(className)}, expected fade-enter-done`
    );
  }
  if (warnings.length) {
    problems.push(`console.warn was called: ${JSON.stringify(warnings)}`);
  }
  if (minHasMessage) {
    problems.push('the min bundle still contains "Could not find the element"');
  }

  if (problems.length) {
    console.error(problems.join('\n'));
    process.exit(1);
  }
  console.log('smoke ok');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
