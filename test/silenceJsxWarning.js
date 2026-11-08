import React from 'react';

// Makes React 19 emit its one-time "outdated JSX transform" warning now, while
// console.warn is silenced. Call again, with the new React, after jest.resetModules().
export default function silenceJsxTransformWarning(react = React) {
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    react.createElement('div', { __self: {}, __source: {} });
  } finally {
    warn.mockRestore();
  }
}
