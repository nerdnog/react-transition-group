import React from 'react';
import { render, act } from './utils';
import Transition from '../src/Transition';
import {
  canFindDOMNode,
  MSG_CHILD_REF,
  MSG_NOT_FOUND,
} from '../src/utils/findNode';
import { enter, Inward, Plain } from './helpers19';

jest.mock('../src/utils/fiberHost', () => ({ findHostNode: () => null }));

const on19 = canFindDOMNode ? it.skip : it;
let warn;
beforeEach(() => {
  warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
  warn.mockRestore();
  jest.useRealTimers();
});

on19(
  'uses the child ref, and warns, when the records are unavailable',
  async () => {
    const c = await enter(<Inward />);
    expect(c.querySelector('input').classList).toContain('fade-enter-done');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(MSG_CHILD_REF);
  }
);
on19('finishes at once and warns when nothing is found', () => {
  jest.useFakeTimers();
  const onEntered = jest.fn();
  const r = render(
    <Transition in={false} timeout={5000} onEntered={onEntered}>
      <Plain />
    </Transition>
  );
  r.setProps({ in: true });
  act(() => {
    jest.advanceTimersByTime(1);
  });
  expect(onEntered).toHaveBeenCalledWith(null, false);
  expect(warn).toHaveBeenCalledWith(MSG_NOT_FOUND);
});
on19('treats a class component child as not found', () => {
  class Klass extends React.Component {
    render() {
      return <p />;
    }
  }
  const r = render(
    <Transition in={false} timeout={0}>
      <Klass />
    </Transition>
  );
  r.setProps({ in: true });
  expect(warn).toHaveBeenCalledWith(MSG_NOT_FOUND);
});
