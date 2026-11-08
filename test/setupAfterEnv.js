import { cleanup } from '@testing-library/react/pure';
import silenceJsxTransformWarning from './silenceJsxWarning';

// React 19 warns once per React instance about the "outdated JSX transform"
// because the test build compiles JSX in development mode (adds `__self`).
// Trigger it here, silenced, so it can't disturb tests that count warnings.
silenceJsxTransformWarning();

afterEach(() => {
  cleanup();
});
