import { beforeAll, afterAll, afterEach, vi } from 'vitest';

beforeAll(() => {
  global.fetch = vi.fn();
});

afterEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  delete (global as unknown as { fetch?: typeof fetch }).fetch;
});

global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
};