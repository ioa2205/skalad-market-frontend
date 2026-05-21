// Vitest replaces `server-only` with this empty module so server-side
// fetchers can be imported directly from tests. The real package guards
// against accidentally bundling RSC code into the browser; that guard is
// not needed in a unit-test context.
export {};
