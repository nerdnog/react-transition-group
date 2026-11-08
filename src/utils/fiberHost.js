/**
 * @license
 * findHostNode and its helpers are ported from React's
 * packages/react-reconciler/src/ReactFiberTreeReflection.js at
 * https://github.com/facebook/react/blob/v19.3.1/packages/react-reconciler/src/ReactFiberTreeReflection.js
 * Modifications: Flow types stripped, constants inlined, React's thrown
 * invariants return null, React's comments removed or condensed.
 *
 * MIT License
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// Constants from ReactWorkTags.js and ReactFiberFlags.js (v19.3.1).
const HostRoot = 3;
const HostComponent = 5;
const HostText = 6;
const HostHoistable = 26;
const HostSingleton = 27;
const NoFlags = 0;
const Placement = 0b0000000000000000000000000000010;
const Hydrating = 0b0000000000000000001000000000000;

function getNearestMountedFiber(fiber) {
  let node = fiber;
  let nearestMounted = fiber;
  let nextNode = node;
  while (nextNode && !nextNode.alternate) {
    node = nextNode;
    if ((node.flags & (Placement | Hydrating)) !== NoFlags) {
      nearestMounted = node.return;
    }
    nextNode = node.return;
  }
  while (node.return) {
    node = node.return;
  }
  if (node.tag === HostRoot) {
    return nearestMounted;
  }
  // Disconnected tree: unmounted.
  return null;
}

function isMounted(fiber) {
  return getNearestMountedFiber(fiber) === fiber;
}

function findCurrentFiberUsingSlowPath(fiber) {
  const alternate = fiber.alternate;
  if (!alternate) {
    const nearestMounted = getNearestMountedFiber(fiber);
    if (nearestMounted === null) {
      return null;
    }
    if (nearestMounted !== fiber) {
      return null;
    }
    return fiber;
  }
  let a = fiber;
  let b = alternate;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const parentA = a.return;
    if (parentA === null) {
      break;
    }
    const parentB = parentA.alternate;
    if (parentB === null) {
      const nextParent = parentA.return;
      if (nextParent !== null) {
        a = b = nextParent;
        continue;
      }
      break;
    }

    if (parentA.child === parentB.child) {
      let child = parentA.child;
      while (child) {
        if (child === a) {
          if (!isMounted(parentA)) return null;
          return fiber;
        }
        if (child === b) {
          if (!isMounted(parentA)) return null;
          return alternate;
        }
        child = child.sibling;
      }
      return null;
    }

    if (a.return !== b.return) {
      a = parentA;
      b = parentB;
    } else {
      let didFindChild = false;
      let child = parentA.child;
      while (child) {
        if (child === a) {
          didFindChild = true;
          a = parentA;
          b = parentB;
          break;
        }
        if (child === b) {
          didFindChild = true;
          b = parentA;
          a = parentB;
          break;
        }
        child = child.sibling;
      }
      if (!didFindChild) {
        child = parentB.child;
        while (child) {
          if (child === a) {
            didFindChild = true;
            a = parentB;
            b = parentA;
            break;
          }
          if (child === b) {
            didFindChild = true;
            b = parentB;
            a = parentA;
            break;
          }
          child = child.sibling;
        }
        if (!didFindChild) {
          return null;
        }
      }
    }

    if (a.alternate !== b) {
      return null;
    }
  }

  if (a.tag !== HostRoot) {
    return null;
  }

  if (a.stateNode.current === a) {
    return fiber;
  }
  return alternate;
}

function findCurrentHostFiberImpl(node) {
  const tag = node.tag;
  if (
    tag === HostComponent ||
    tag === HostHoistable ||
    tag === HostSingleton ||
    tag === HostText
  ) {
    return node;
  }

  let child = node.child;
  while (child !== null) {
    const match = findCurrentHostFiberImpl(child);
    if (match !== null) {
      return match;
    }
    child = child.sibling;
  }

  return null;
}

/**
 * Returns the first DOM element or text node rendered by a class component,
 * read from React's fiber internals as React 17 and later lay them out. Used
 * on React 19, which has no findDOMNode. Never throws; returns null when
 * React's records are missing or the component is unmounted.
 */
export function findHostNode(instance) {
  try {
    const fiber = instance && instance._reactInternals;
    if (!fiber) return null;
    const current = findCurrentFiberUsingSlowPath(fiber);
    if (current === null) return null;
    const host = findCurrentHostFiberImpl(current);
    return host ? host.stateNode || null : null;
  } catch (e) {
    return null;
  }
}
