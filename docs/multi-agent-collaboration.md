# Multi-agent collaboration protocol

This repository is part of a coordinated API/frontend project. The Laravel API repository is the source of truth for backend behavior and API contracts.

## Before starting work

1. Read the latest commits on dev.
2. Read this document, AGENTS.md, and the latest related pull requests.
3. Do not modify the API repository directly.
4. Treat the API contract as the source of truth for frontend integration.
5. Document every cross-repository dependency.

## API contract changes

When an API endpoint, request, response, authentication flow, or error format changes:

1. Fetch the latest API dev branch.
2. Verify the request and response shape.
3. Add or update frontend tests for loading, success, empty and error states.
4. Document incompatibilities before changing assumptions.

The contract may be documented in the API repository as docs/openapi.yaml or docs/api-contract.md.

## Frontend integration

When consuming an API change:

1. Confirm the API endpoint and response contract.
2. Implement the API client before the UI when practical.
3. Handle loading, success, empty and error states.
4. Mention the API dependency in the commit and pull request.
5. Update docs/progress.md when the file exists.

## Git workflow

- Create a dedicated branch for every change.
- Feature and fix branches target dev.
- Only dev targets main.
- Keep commits atomic.
- Use English Conventional Commits, for example:
  - feat(scope): add city selection page
  - fix(scope): handle API loading state
  - chore(scope): update API contract

## Handoff

Every cross-repository change must state:

- what was implemented;
- the API contract or endpoint affected;
- the frontend/API dependency;
- remaining work and validation results.

Use the pull request description or docs/progress.md for this handoff.

## Delivery order

Prefer this sequence:

API endpoint -> API test -> API contract -> frontend client -> frontend UI -> integration validation

Run all configured tests, linters, type checks and build checks before committing.
