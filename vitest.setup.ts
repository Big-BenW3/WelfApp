// Test setup - minimal for node environment
process.env.SESSION_SECRET ??= "test-session-secret-for-dev-only";
process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/wella";
