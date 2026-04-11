/**
 * Linker script to validate environment variables before building
 */
const requiredEnv = [
  'DATABASE_URL',
  'NEXT_PUBLIC_VAPID_PUBLIC_KEY',
  'VAPID_PRIVATE_KEY'
];

console.log('🔍 Validating environment variables...');

const missing = requiredEnv.filter(env => !process.env[env]);

if (missing.length > 0) {
  console.warn(`⚠️ Warning: Missing environment variables: ${missing.join(', ')}`);
  console.warn('Production build may fail if these are required during build-time (e.g. for static generation).');
  // We don't exit(1) to allow building even if some envs are passed during CI later
} else {
  console.log('✅ Environment variables are present.');
}

process.exit(0);
