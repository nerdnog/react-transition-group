jest.mock('../src/utils/fiberHost', () => ({ findHostNode: jest.fn() }));
import React from 'react';
import ReactDOM from 'react-dom';
import { render } from './utils';
import { findHostNode } from '../src/utils/fiberHost';
import {
  findNode,
  canFindDOMNode,
  MSG_CHILD_REF,
  MSG_NOT_FOUND,
} from '../src/utils/findNode';

const on18 = canFindDOMNode ? it : it.skip;
const on19 = canFindDOMNode ? it.skip : it;
let warn;
beforeEach(() => {
  warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  findHostNode.mockReset();
});
afterEach(() => warn.mockRestore());

on18('uses findDOMNode and nothing else', () => {
  const ref = React.createRef();
  class Box extends React.Component {
    render() {
      return <div />;
    }
  }
  render(<Box ref={ref} />);
  expect(findNode(ref.current)).toBe(ReactDOM.findDOMNode(ref.current));
  expect(findHostNode).not.toHaveBeenCalled();
});

on19('returns the internal-records result without warning', () => {
  const el = document.createElement('div');
  findHostNode.mockReturnValue(el);
  expect(findNode({}, { current: null })).toBe(el);
  expect(warn).not.toHaveBeenCalled();
});

on19('falls back to the child ref and warns once', () => {
  const el = document.createElement('input');
  findHostNode.mockReturnValue(null);
  const inst = {};
  expect(findNode(inst, { current: el })).toBe(el);
  findNode(inst, { current: el });
  expect(warn).toHaveBeenCalledTimes(1);
  expect(warn).toHaveBeenCalledWith(MSG_CHILD_REF);
});

on19('ignores a child ref that is not a DOM element', () => {
  findHostNode.mockReturnValue(null);
  expect(findNode({}, { current: {} })).toBeNull();
  expect(warn).toHaveBeenCalledWith(MSG_NOT_FOUND);
});

on19('warns once per instance when nothing is found', () => {
  findHostNode.mockReturnValue(null);
  const a = {};
  findNode(a);
  findNode(a);
  findNode({});
  expect(warn).toHaveBeenCalledTimes(2);
});

on19('stays silent in production', () => {
  findHostNode.mockReturnValue(null);
  const before = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    findNode({});
  } finally {
    process.env.NODE_ENV = before;
  }
  expect(warn).not.toHaveBeenCalled();
});
