import React from 'react';
import { render, waitFor } from './utils';
import CSSTransition from '../src/CSSTransition';

export const enter = async (child, wrap = (x) => x) => {
  const r = render(
    wrap(
      <CSSTransition in={false} timeout={10} classNames="fade">
        {child}
      </CSSTransition>
    )
  );
  r.rerender(
    wrap(
      <CSSTransition in timeout={10} classNames="fade">
        {child}
      </CSSTransition>
    )
  );
  await waitFor(() =>
    expect(r.container.querySelector('.fade-enter-done')).not.toBeNull()
  );
  return r.container;
};

export const Inward = React.forwardRef((p, ref) => (
  <div className="outer">
    <input ref={ref} />
  </div>
));

export const Plain = () => <section />;
