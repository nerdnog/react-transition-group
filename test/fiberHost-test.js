import React from 'react';
import ReactDOM from 'react-dom';
import { render } from './utils';
import { findHostNode } from '../src/utils/fiberHost';

class Probe extends React.Component {
  render() {
    return this.props.children;
  }
}
const probe = (children) => {
  const ref = React.createRef();
  const result = render(<Probe ref={ref}>{children}</Probe>);
  return { ref, result };
};
const Inward = React.forwardRef((props, ref) => (
  <div className="outer">
    <input ref={ref} />
  </div>
));

it('returns the outer element when the child puts its ref on an inner one', () => {
  const { ref } = probe(<Inward />);
  expect(findHostNode(ref.current).className).toBe('outer');
});

it('returns the element on screen after the child changes type', () => {
  const { ref, result } = probe(<div />);
  result.rerender(
    <Probe ref={ref}>
      <span />
    </Probe>
  );
  expect(findHostNode(ref.current).tagName).toBe('SPAN');
  result.rerender(
    <Probe ref={ref}>
      <b />
    </Probe>
  );
  expect(findHostNode(ref.current).tagName).toBe('B');
});

it('returns a text node when text comes first', () => {
  const { ref } = probe('hello');
  expect(findHostNode(ref.current).nodeType).toBe(3);
});

it('returns null when nothing is rendered', () => {
  expect(findHostNode(probe(null).ref.current)).toBeNull();
});

it('returns null for an object without React records', () => {
  expect(findHostNode({})).toBeNull();
});

(typeof ReactDOM.findDOMNode === 'function' ? it : it.skip)(
  'agrees with findDOMNode on React 18',
  () => {
    const { ref } = probe(<Inward />);
    expect(findHostNode(ref.current)).toBe(ReactDOM.findDOMNode(ref.current));
  }
);
