# @nerdnog/react-transition-group

> **Unofficial fork.** This is not the official react-transition-group, and its authors haven't endorsed it. It has the same API and works on React 19, where the original crashes without `nodeRef`.

## Why

React 19 removed `ReactDOM.findDOMNode`. react-transition-group 4.4.5 calls it whenever a transition has no `nodeRef`, so on React 19 those transitions crash. The upstream report is [issue 918](https://github.com/reactjs/react-transition-group/issues/918). This fork replaces those calls and changes nothing else.

## Install

Each of these keeps the import name `react-transition-group`, so your imports and `@types/react-transition-group` keep working.

npm, in `package.json`:

```json
"overrides": { "react-transition-group": "npm:@nerdnog/react-transition-group@^4.5.0" }
```

Yarn, in `package.json`:

```json
"resolutions": { "react-transition-group": "npm:@nerdnog/react-transition-group@^4.5.0" }
```

pnpm, in `package.json`:

```json
"pnpm": { "overrides": { "react-transition-group": "npm:@nerdnog/react-transition-group@^4.5.0" } }
```

Directly:

```
npm install react-transition-group@npm:@nerdnog/react-transition-group@^4.5.0
```

## What's different

The only change is how a transition finds the element to animate when you don't pass `nodeRef`:

1. On React 16 to 18 it calls `findDOMNode`, exactly as 4.4.5 does. Nothing changes there.
2. On React 19 it reads the element from React's internal records.
3. If that fails, it uses a ref the transition adds to its child. That ref can land on an inner element if the child forwards it, so pass `nodeRef` when that matters.
4. If there's still no element, the transition finishes at once, as 4.4.5 did when it found none.

Two warnings, shown only in development builds and once per component: one when the element came from the child's ref (step 3), and one when no element was found (step 4). The `nodeRef` prop works as before and skips all of this.

## Not covered

- Other React 19 problems in libraries that use react-transition-group (reactstrap, for example). If a library has its own `findDOMNode` calls or its own copy of this code, this fork doesn't reach them.
- Upstream's other open bugs. Behavior matches 4.4.5.

## Credit

This is a fork of [react-transition-group](https://github.com/reactjs/react-transition-group), made by its [contributors](https://github.com/reactjs/react-transition-group/graphs/contributors) and released under the BSD-3-Clause license, whose copyright notice is kept in `LICENSE`. The code that reads React's internal records is ported from [React](https://github.com/facebook/react) (MIT license), and is credited in its source file.

## Original readme

The rest of this page is the original project's readme, unchanged except that its headings moved down one level. Links in it point to the original project.

## react-transition-group [![npm][npm-badge]][npm]

> **ATTENTION!** To address many issues that have come up over the years, the API in v2 and above is not backwards compatible with the original [`React addon (v1-stable)`](https://github.com/reactjs/react-transition-group/tree/v1-stable).
>
> **For a drop-in replacement for `react-addons-transition-group` and `react-addons-css-transition-group`, use the v1 release. Documentation and code for that release are available on the [`v1-stable`](https://github.com/reactjs/react-transition-group/tree/v1-stable) branch.**
>
> We are no longer updating the v1 codebase, please upgrade to the latest version when possible

A set of components for managing component states (including mounting and unmounting) over time, specifically designed with animation in mind.

### Documentation

- [**Main documentation**](https://reactcommunity.org/react-transition-group/)
- [Migration guide from v1](https://github.com/reactjs/react-transition-group/blob/master/Migration.md)

### TypeScript
TypeScript definitions are published via [**DefinitelyTyped**](https://github.com/DefinitelyTyped/DefinitelyTyped) and can be installed via the following command:

```
npm install @types/react-transition-group
```

### Examples

Clone the repo first:

```
git@github.com:reactjs/react-transition-group.git
```

Then run `npm install` (or `yarn`), and finally `npm run storybook` to start a storybook instance that you can navigate to in your browser to see the examples.

[npm-badge]: https://img.shields.io/npm/v/react-transition-group.svg
[npm]: https://www.npmjs.org/package/react-transition-group
