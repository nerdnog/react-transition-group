/**
 * @jest-environment node
 */

import React from 'react';
import { renderToString } from 'react-dom/server';
// test that import does not crash
import * as ReactTransitionGroup from '../src';

describe('SSR', () => {
  it('should import react-transition-group in node env', () => {});

  it('renders a child without nodeRef to a string', () => {
    const { Transition, CSSTransition } = ReactTransitionGroup;
    expect(
      renderToString(
        <Transition in timeout={0}>
          <div id="t" />
        </Transition>
      )
    ).toContain('id="t"');
    expect(
      renderToString(
        <CSSTransition in timeout={0} classNames="fade">
          <div id="c" />
        </CSSTransition>
      )
    ).toContain('id="c"');
  });
});
