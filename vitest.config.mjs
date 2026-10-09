import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));

export default {
  resolve: { alias: { '@': root } },
  test: {
    environment: 'node',
    include: ['app/**/*.test.{ts,tsx}', 'lib/**/*.test.{ts,tsx}', 'components/**/*.test.{ts,tsx}', 'hooks/**/*.test.{ts,tsx}'],
    exclude: ['node_modules/**', '.next/**', '.mimocode/**', 'android/**', 'mobile/**', 'merged/**', 'text/**', 'e2e/**'],
  },
};
