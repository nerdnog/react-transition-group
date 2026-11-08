import React from 'react';
import { render, waitFor } from './utils';
import CSSTransition from '../src/CSSTransition';
import Transition from '../src/Transition';
import ReplaceTransition from '../src/ReplaceTransition';
import TransitionGroup from '../src/TransitionGroup';
import SwitchTransition from '../src/SwitchTransition';
import { canFindDOMNode } from '../src/utils/findNode';
import { enter, Inward, Plain } from './helpers19';

// React 16-18 log a deprecation for findDOMNode (StrictMode has its own
// message). That is 4.4.5's behavior; silence it here and assert it where a
// test expects it.
let errorSpy;
beforeEach(() => {
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  const unexpected = errorSpy.mock.calls.filter(
    (args) => !(canFindDOMNode && /findDOMNode/.test(args.join(' ')))
  );
  errorSpy.mockRestore();
  expect(unexpected).toEqual([]);
});

it('animates a child without nodeRef (issue 918)', async () => {
  const c = await enter(<div id="box" />);
  expect(c.querySelector('#box').classList).toContain('fade-enter-done');
});
it('animates a child component that ignores ref', async () => {
  expect(
    (await enter(<Plain />)).querySelector('section.fade-enter-done')
  ).not.toBeNull();
});
it('puts the classes on the outer element when the child forwards its ref inward', async () => {
  const c = await enter(<Inward />);
  expect(c.querySelector('.outer').classList).toContain('fade-enter-done');
  expect(c.querySelector('input').classList).not.toContain('fade-enter-done');
});
it('passes the element to onEnter for render-prop children', () => {
  const onEnter = jest.fn();
  const r = render(
    <Transition in={false} timeout={0} onEnter={onEnter}>
      {() => <div id="rp" />}
    </Transition>
  );
  r.setProps({ in: true });
  expect(onEnter.mock.calls[0][0].id).toBe('rp');
});
it("keeps the child's own object ref and callback ref working", async () => {
  const obj = React.createRef();
  const cb = jest.fn();
  await enter(<div ref={obj} />);
  expect(obj.current.tagName).toBe('DIV');
  await enter(<div ref={cb} />);
  expect(cb).toHaveBeenCalledWith(expect.any(HTMLDivElement));
});
it('works inside StrictMode', async () => {
  const c = await enter(<div id="sm" />, (x) => (
    <React.StrictMode>{x}</React.StrictMode>
  ));
  expect(c.querySelector('#sm').classList).toContain('fade-enter-done');
  if (canFindDOMNode) {
    expect(errorSpy.mock.calls.join('\n')).toMatch(/findDOMNode/);
  }
});
it('gives ReplaceTransition handlers an element', () => {
  const onEnter = jest.fn();
  const pair = (on) => (
    <ReplaceTransition in={on} onEnter={onEnter}>
      <Transition timeout={0}>
        <div id="a" />
      </Transition>
      <Transition timeout={0}>
        <div id="b" />
      </Transition>
    </ReplaceTransition>
  );
  const r = render(pair(false));
  r.rerender(pair(true));
  expect(onEnter.mock.calls[0][0]).toBeInstanceOf(Element);
});
it('animates TransitionGroup children without nodeRef', async () => {
  const group = (items) => (
    <TransitionGroup>
      {items.map((id) => (
        <CSSTransition key={id} timeout={10} classNames="fade">
          <div id={id} />
        </CSSTransition>
      ))}
    </TransitionGroup>
  );
  const r = render(group([]));
  r.rerender(group(['g1']));
  await waitFor(() =>
    expect(r.container.querySelector('#g1.fade-enter-done')).not.toBeNull()
  );
});
it('animates SwitchTransition children without nodeRef', async () => {
  const sw = (key) => (
    <SwitchTransition mode="out-in">
      <CSSTransition key={key} timeout={10} classNames="fade">
        <div id={key} />
      </CSSTransition>
    </SwitchTransition>
  );
  const r = render(sw('s1'));
  r.rerender(sw('s2'));
  await waitFor(() =>
    expect(r.container.querySelector('#s2.fade-enter-done')).not.toBeNull()
  );
});
