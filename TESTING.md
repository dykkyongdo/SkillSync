# Testing Setup for SkillSync

This document outlines the comprehensive testing setup for the SkillSync project, including unit testing, integration testing, and end-to-end testing.

## Frontend Testing

### Jest + React Testing Library (Unit Testing)

The frontend uses Jest with React Testing Library for unit testing React components.

#### Setup
- **Jest**: JavaScript testing framework
- **React Testing Library**: Simple and complete testing utilities for React components
- **Jest DOM**: Custom Jest matchers for DOM elements
- **User Event**: Fire events the same way the user does

#### Configuration Files
- `jest.config.js`: Jest configuration with Next.js integration
- `jest.setup.js`: Global test setup and mocks

#### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

#### Test Examples
- `src/components/ui/__tests__/button.test.tsx`: Button component tests
- `src/components/ui/__tests__/card.test.tsx`: Card component tests
- `src/components/__tests__/Navbar.test.tsx`: Navbar component tests

### Cypress (End-to-End Testing)

Cypress is used for end-to-end testing of the application.

#### Setup
- **Cypress**: End-to-end testing framework
- **Component Testing**: Test individual React components in isolation

#### Configuration Files
- `cypress.config.ts`: Cypress configuration for E2E and component testing
- `cypress/support/`: Support files for commands and setup

#### Running Tests
```bash
# Open Cypress Test Runner
npm run cypress:open

# Run E2E tests headlessly
npm run cypress:run

# Run E2E tests (alias)
npm run test:e2e
```

#### Test Examples
- `cypress/e2e/navigation.cy.ts`: Navigation and authentication flow tests
- `src/components/ui/button.cy.tsx`: Button component tests in Cypress

## Backend Testing

### Spring Boot Testing Stack

The backend uses Spring Boot's testing framework with additional libraries for comprehensive testing.

#### Dependencies
- **Spring Boot Test**: Core testing framework
- **Spring Security Test**: Security testing utilities
- **Testcontainers**: Integration testing with real databases
- **Mockito**: Mocking framework
- **AssertJ**: Fluent assertions
- **JaCoCo**: Code coverage reporting

#### Running Tests
```bash
# Run all tests
mvn test

# Run tests with coverage report
mvn test jacoco:report

# Run specific test class
mvn test -Dtest=AuthControllerTest
```

#### Test Types

##### Unit Tests
- `AuthControllerTest.java`: Controller unit tests with mocked dependencies
- Uses `@WebMvcTest` for focused controller testing
- Mocks service layer dependencies

##### Integration Tests
- `AuthIntegrationTest.java`: Full integration tests with real database
- Uses `@Testcontainers` for PostgreSQL container
- Tests complete request/response cycle
- Uses `@Transactional` for test isolation

#### Configuration
- `application-test.yml`: Test-specific configuration
- Uses H2 in-memory database for fast unit tests
- Uses PostgreSQL container for integration tests

## Test Coverage

### Frontend Coverage
- Jest coverage reports are generated in `coverage/` directory
- Coverage threshold: 70% for branches, functions, lines, and statements
- View coverage: Open `coverage/lcov-report/index.html`

### Backend Coverage
- JaCoCo generates coverage reports in `target/site/jacoco/`
- Coverage threshold: 60% instruction coverage
- View coverage: Open `target/site/jacoco/index.html`

## Running All Tests

### From Root Directory
```bash
# Frontend tests
npm run test

# Frontend E2E tests
npm run test:e2e

# Backend tests
npm run backend:test

# Backend tests with coverage
npm run backend:test:coverage
```

### Individual Components
```bash
# Frontend only
cd frontend
npm test
npm run cypress:open

# Backend only
cd backend
mvn test
mvn test jacoco:report
```

## Test Best Practices

### Frontend Testing
1. **Test user behavior, not implementation details**
2. **Use data-testid attributes for reliable element selection**
3. **Mock external dependencies and API calls**
4. **Test accessibility features**
5. **Use realistic test data**

### Backend Testing
1. **Test at the appropriate level (unit vs integration)**
2. **Use Testcontainers for integration tests**
3. **Mock external dependencies in unit tests**
4. **Test error scenarios and edge cases**
5. **Use meaningful test data**

## Continuous Integration

### GitHub Actions (Recommended)
```yaml
name: Tests
on: [push, pull_request]
jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm ci
      - run: cd frontend && npm test
      - run: cd frontend && npm run test:e2e

  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '17'
      - run: cd backend && mvn test
      - run: cd backend && mvn test jacoco:report
```

## Troubleshooting

### Common Issues

#### Frontend Tests
- **Module resolution errors**: Check Jest configuration and path mappings
- **Mock issues**: Ensure mocks are properly configured in `jest.setup.js`
- **Cypress timeouts**: Increase timeout values in `cypress.config.ts`

#### Backend Tests
- **Database connection issues**: Check test configuration and Testcontainers setup
- **Mock failures**: Verify Mockito annotations and mock configurations
- **Coverage issues**: Ensure JaCoCo plugin is properly configured

### Debug Commands
```bash
# Frontend debug
npm test -- --verbose
npm run cypress:open -- --config video=false

# Backend debug
mvn test -X
mvn test -Dtest=AuthControllerTest -Dmaven.test.failure.ignore=true
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Spring Boot Testing](https://spring.io/guides/gs/testing-web/)
- [Testcontainers](https://www.testcontainers.org/)
