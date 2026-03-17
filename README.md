# Playwright E2E Test Project

This project uses Playwright for E2E automation. It includes ChatGPT chat tests and uses a saved auth state for login.

## Prerequisites

1. Node.js 18+ and npm. Check with:
   - `node -v` and `npm -v`

2. From the project root:

   ```bash
   cd "/path/to/playwright- test"
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

   If that fails, try:

   ```bash
   npm install @playwright/test typescript --save-dev
   ```

4. Install browsers:

   ```bash
   npx playwright install
   ```

## Auth (ChatGPT login)

Before running ChatGPT tests, save your login state once:

```bash
npm run auth
```

A browser will open. Log in to ChatGPT; when your profile name appears in the bottom-left, the script saves cookies and localStorage to `.auth/chatgpt-state.json`. Later test runs load this file so you stay logged in.

## Directory structure

- `package.json` – scripts and dependencies
- `tsconfig.json` – TypeScript config
- `playwright.config.ts` – Playwright config (test dir, browsers, baseURL)
- `playwright.auth.config.ts` – config used by `npm run auth`
- `tests/` – E2E specs
  - `chatgpt.spec.ts` – ChatGPT chat tests
  - `auth-setup.spec.ts` – one-time auth save (run via `npm run auth`)
- `pages/` – page objects (e.g. ChatGPTPage)

## Commands

From the project root:

- Run all tests:
  ```bash
  npx playwright test
  # or
  npm test
  ```

- Run with browser visible:
  ```bash
  npm run test:headed
  ```

- Open Playwright UI:
  ```bash
  npm run test:ui
  ```

- Open HTML report:
  ```bash
  npx playwright show-report
  ```

## Next steps

- Change `baseURL` in `playwright.config.ts` if you test a different app.
- Add more `*.spec.ts` files under `tests/` for other flows.
