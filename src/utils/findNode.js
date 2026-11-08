import ReactDOM from 'react-dom';
import { findHostNode } from './fiberHost';

export const canFindDOMNode = typeof ReactDOM.findDOMNode === 'function';

export const MSG_CHILD_REF =
  "[@nerdnog/react-transition-group] React's internal records were unavailable, so the element came from the child's ref, which may be an inner element. Pass `nodeRef` to choose the element.";
export const MSG_NOT_FOUND =
  '[@nerdnog/react-transition-group] Could not find the element to animate, so the transition finished at once. Pass `nodeRef` to fix this.';

// instance -> messages already shown for it
const shown = new WeakMap();

function warnOnce(instance, message) {
  let messages = shown.get(instance);
  if (!messages) {
    messages = new Set();
    shown.set(instance, messages);
  }
  if (messages.has(message)) return;
  messages.add(message);
  console.warn(message);
}

export function findNode(instance, childRef) {
  if (canFindDOMNode) return ReactDOM.findDOMNode(instance);

  const host = findHostNode(instance);
  if (host !== null) return host;

  const fromRef = childRef && childRef.current;
  if (fromRef && fromRef.nodeType === 1) {
    if (process.env.NODE_ENV !== 'production')
      warnOnce(instance, MSG_CHILD_REF);
    return fromRef;
  }

  if (process.env.NODE_ENV !== 'production') warnOnce(instance, MSG_NOT_FOUND);
  return null;
}
