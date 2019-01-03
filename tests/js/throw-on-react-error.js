// eslint-disable-next-line no-console
const originalConsoleError = console.error;

// eslint-disable-next-line no-console
console.error = (message, ...args) => {
  originalConsoleError(message, ...args);

  // List of `console.error` messages to fail on
  if (
    /(Failed prop type|Failed child context type|React does not recognize the `[^`]+` prop on a DOM element)/.test(
      message
    )
  ) {
    throw new Error(message);
  }
};

// projectReleases, onboarding
