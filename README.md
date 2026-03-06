# Playwright E2E 测试项目

本项目是使用 Playwright 搭建的 E2E 自动化测试框架，目录名为 `playwright- test`。

## 环境准备

1. 安装 Node.js（推荐 18+ 版本），可在本机终端中执行：
   - `node -v` 和 `npm -v` 确认已安装。

2. 进入项目目录：

   ```bash
   cd "/Users/jiao.li/Documents/Projects/playwright- test"
   ```

3. 安装依赖：

   ```bash
   npm install
   ```

   如果依赖安装失败，可以尝试先运行：

   ```bash
   npm install @playwright/test typescript --save-dev
   ```

4. 安装浏览器（本机执行）：

   ```bash
   npx playwright install
   ```

## 目录结构

- `package.json`：项目配置与测试脚本。
- `tsconfig.json`：TypeScript 配置。
- `playwright.config.ts`：Playwright 全局配置（测试目录、浏览器配置、baseURL 等）。
- `tests/`：E2E 测试用例目录。
  - `example.spec.ts`：示例测试用例。

## 常用命令

在项目根目录执行（`/Users/jiao.li/Documents/Projects/playwright- test`）：

- 运行所有测试：

  ```bash
  npx playwright test
  # 或使用 package.json 中的脚本
  npm test
  ```

- 打开测试 UI：

  ```bash
  npx playwright test --ui
  # 或
  npm run test:ui
  ```

- 以有界面模式运行（非 headless）：

  ```bash
  npm run test:headed
  ```

- 打开生成的 HTML 报告：

  ```bash
  npx playwright show-report
  ```

## 下一步

- 将 `playwright.config.ts` 中的 `baseURL` 改成你要测的应用地址（例如：http://localhost:8080）。
- 在 `tests` 目录下按模块创建更多 `*.spec.ts` 文件，组织你的 E2E 用例。

