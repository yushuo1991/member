# Testing Guide - 宇硕会员体系

This guide explains how to run and write tests for the Yushuo Membership System monorepo.

## Table of Contents

- [Overview](#overview)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [Coverage Reports](#coverage-reports)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The testing system uses:
- **Jest** - Testing framework
- **ts-jest** - TypeScript support for Jest
- **@testing-library/react** - React component testing utilities
- **@testing-library/jest-dom** - Custom Jest matchers for DOM

## Running Tests

### Run All Tests

```bash
pnpm test
```

### Run Tests in Watch Mode

Watch mode automatically re-runs tests when files change:

```bash
pnpm test:watch
```

### Run Tests with Coverage

Generate a coverage report:

```bash
pnpm test:coverage
```

Coverage reports are generated in the `coverage/` directory.

### Run Specific Test Files

```bash
# Run a specific test file
pnpm test packages/auth/src/__tests__/password.test.ts

# Run tests matching a pattern
pnpm test --testPathPattern=auth

# Run tests in a specific directory
pnpm test packages/auth
```

### Run Tests for Specific Packages

```bash
# Test auth package only
pnpm test packages/auth

# Test web app only
pnpm test apps/web
```

## Test Structure

Tests are organized in `__tests__` directories alongside the code they test:

```
packages/auth/src/
├── __tests__/
│   ├── auth-middleware.test.ts
│   └── password.test.ts
├── auth-middleware.ts
└── password.ts

apps/web/src/lib/
├── __tests__/
│   ├── membership-levels.test.ts
│   └── trial-service.test.ts
├── membership-levels.ts
└── trial-service.ts
```

## Writing Tests

### Basic Test Structure

```typescript
describe('Feature Name', () => {
  describe('functionName', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = functionName(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Testing Async Functions

```typescript
it('should hash password successfully', async () => {
  const password = 'testPassword123';
  const hash = await hashPassword(password);

  expect(hash).toBeDefined();
  expect(hash).not.toBe(password);
});
```

### Testing Error Cases

```typescript
it('should throw error for invalid input', async () => {
  await expect(functionName('invalid')).rejects.toThrow();
});
```

### Using Mocks

```typescript
// Mock a module
jest.mock('../database', () => ({
  query: jest.fn(),
}));

// Mock a function
const mockQuery = jest.fn().mockResolvedValue({ rows: [] });
```

## Existing Test Suites

### 1. Password Tests (`packages/auth/src/__tests__/password.test.ts`)

Tests password hashing and verification:
- Password hashing with bcrypt
- Password verification
- Special characters and Chinese characters support
- Security best practices

**Run:**
```bash
pnpm test password.test.ts
```

### 2. Auth Middleware Tests (`packages/auth/src/__tests__/auth-middleware.test.ts`)

Tests JWT authentication:
- Token generation
- Token verification
- User and admin token validation
- Cookie management
- Request authentication flow

**Run:**
```bash
pnpm test auth-middleware.test.ts
```

### 3. Membership Levels Tests (`apps/web/src/lib/__tests__/membership-levels.test.ts`)

Tests membership permission system:
- Access control by membership level
- Membership expiry checking
- Product access permissions
- Membership calculations
- Badge colors and pricing

**Run:**
```bash
pnpm test membership-levels.test.ts
```

### 4. Trial Service Tests (`apps/web/src/lib/__tests__/trial-service.test.ts`)

Tests trial functionality:
- Trial product identification
- Trial count management
- Trial status checking
- Trial button text generation
- Product redirect URLs

**Run:**
```bash
pnpm test trial-service.test.ts
```

## Coverage Reports

After running `pnpm test:coverage`, view the coverage report:

### Terminal Output

Coverage summary is displayed in the terminal:

```
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   85.23 |    78.45 |   90.12 |   84.67 |
 auth-middleware.ts |   92.31 |    85.71 |   95.00 |   91.89 |
 password.ts        |   100.0 |    100.0 |   100.0 |   100.0 |
--------------------|---------|----------|---------|---------|
```

### HTML Report

Open `coverage/lcov-report/index.html` in a browser for detailed coverage visualization.

## Best Practices

### 1. Test Organization

- Group related tests using `describe` blocks
- Use clear, descriptive test names
- Follow the Arrange-Act-Assert pattern
- Keep tests focused and independent

### 2. Test Coverage

- Aim for at least 80% code coverage
- Test both success and failure cases
- Test edge cases and boundary conditions
- Test error handling

### 3. Test Data

- Use realistic test data
- Avoid hardcoding sensitive information
- Use factories or fixtures for complex data
- Clean up test data after tests

### 4. Async Testing

- Always use `async/await` for async tests
- Don't forget to `await` promises
- Test both resolved and rejected promises

### 5. Mocking

- Mock external dependencies (database, APIs)
- Don't mock the code you're testing
- Clear mocks between tests
- Use `jest.clearAllMocks()` in `beforeEach`

### 6. Test Naming

Good test names:
```typescript
it('should return true when password matches hash')
it('should throw error when token is expired')
it('should allow yearly members to access monthly content')
```

Bad test names:
```typescript
it('works')
it('test password')
it('should work correctly')
```

## Environment Variables

Test environment variables are set in `jest.setup.js`:

```javascript
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.BCRYPT_ROUNDS = '10'; // Lower rounds for faster tests
process.env.NODE_ENV = 'test';
```

## Troubleshooting

### Tests Fail with "Cannot find module"

**Solution:** Check module path mappings in `jest.config.js`:

```javascript
moduleNameMapper: {
  '^@repo/auth$': '<rootDir>/packages/auth/src/index.ts',
  '^@/(.*)$': '<rootDir>/apps/web/src/$1',
}
```

### TypeScript Errors in Tests

**Solution:** Ensure `ts-jest` is configured correctly in `jest.config.js`:

```javascript
transform: {
  '^.+\\.tsx?$': ['ts-jest', {
    tsconfig: {
      jsx: 'react',
      esModuleInterop: true,
    },
  }],
}
```

### Tests Timeout

**Solution:** Increase Jest timeout:

```typescript
jest.setTimeout(10000); // 10 seconds
```

Or for specific tests:

```typescript
it('should complete long operation', async () => {
  // test code
}, 10000); // 10 second timeout
```

### Database Connection Errors

**Solution:** Mock database connections in tests:

```typescript
jest.mock('@repo/database', () => ({
  query: jest.fn(),
  getConnection: jest.fn(),
}));
```

### Coverage Thresholds Not Met

**Solution:** Either:
1. Write more tests to increase coverage
2. Adjust thresholds in `jest.config.js`:

```javascript
coverageThresholds: {
  global: {
    branches: 50,
    functions: 50,
    lines: 50,
    statements: 50,
  },
}
```

## Adding New Tests

### 1. Create Test File

Create a test file in the `__tests__` directory:

```bash
mkdir -p packages/mypackage/src/__tests__
touch packages/mypackage/src/__tests__/mymodule.test.ts
```

### 2. Write Tests

```typescript
import { myFunction } from '../mymodule';

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

### 3. Run Tests

```bash
pnpm test mymodule.test.ts
```

## Continuous Integration

Tests should be run in CI/CD pipelines:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test:coverage
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)

## Support

For questions or issues with testing:
1. Check this guide first
2. Review existing test files for examples
3. Check Jest documentation
4. Ask the development team

---

**Last Updated:** 2026-02-07
**Version:** 1.0.0
